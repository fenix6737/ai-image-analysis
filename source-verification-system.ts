/**
 * Source Verification System
 * 
 * Ensures response reliability by tracking information sources,
 * separating verified facts from inferences, and maintaining transparency.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum SourceType {
  PRIMARY = 'primary',           // Direct observation, file system, API response
  SECONDARY = 'secondary',       // Documentation, official sources
  INFERENCE = 'inference',       // Logical deduction from available data
  SPECULATION = 'speculation',   // Educated guess without confirmation
  UNKNOWN = 'unknown'           // Source cannot be determined
}

export enum ConfidenceLevel {
  VERIFIED = 'verified',         // 100% confirmed
  HIGH = 'high',                 // 90%+ confidence
  MEDIUM = 'medium',             // 60-90% confidence
  LOW = 'low',                   // 30-60% confidence
  UNCERTAIN = 'uncertain'        // <30% confidence
}

export interface SourceReference {
  type: SourceType;
  confidence: ConfidenceLevel;
  description: string;
  timestamp: Date;
  url?: string;
  fileReference?: string;
  verificationMethod?: string;
}

export interface VerifiedStatement {
  statement: string;
  sources: SourceReference[];
  confidence: ConfidenceLevel;
  caveats?: string[];
}

export interface ResponseVerification {
  verifiedFacts: VerifiedStatement[];
  inferences: VerifiedStatement[];
  uncertainties: VerifiedStatement[];
  overallConfidence: ConfidenceLevel;
  needsUserConfirmation: boolean;
}

// ============================================================================
// Source Tracker
// ============================================================================

export class SourceTracker {
  private sources: Map<string, SourceReference[]> = new Map();
  private verificationLog: Array<{
    timestamp: Date;
    action: string;
    result: string;
  }> = [];

  /**
   * Add a source reference for a statement
   */
  addSource(statement: string, source: SourceReference): void {
    const existing = this.sources.get(statement) || [];
    existing.push(source);
    this.sources.set(statement, existing);

    this.logVerification('add_source', `Added ${source.type} source for statement`);
  }

  /**
   * Get all sources for a statement
   */
  getSources(statement: string): SourceReference[] {
    return this.sources.get(statement) || [];
  }

  /**
   * Calculate confidence level based on sources
   */
  calculateConfidence(statement: string): ConfidenceLevel {
    const sources = this.getSources(statement);
    
    if (sources.length === 0) {
      return ConfidenceLevel.UNCERTAIN;
    }

    // Check for verified sources
    const hasVerified = sources.some(s => 
      s.type === SourceType.PRIMARY && s.confidence === ConfidenceLevel.VERIFIED
    );
    if (hasVerified) {
      return ConfidenceLevel.VERIFIED;
    }

    // Check for high-confidence sources
    const hasHighConfidence = sources.some(s => 
      s.confidence === ConfidenceLevel.HIGH
    );
    if (hasHighConfidence) {
      return ConfidenceLevel.HIGH;
    }

    // Average confidence from multiple sources
    const avgConfidence = this.averageConfidence(sources);
    return avgConfidence;
  }

  /**
   * Check if statement needs user confirmation
   */
  needsConfirmation(statement: string): boolean {
    const confidence = this.calculateConfidence(statement);
    return confidence === ConfidenceLevel.LOW || 
           confidence === ConfidenceLevel.UNCERTAIN;
  }

  /**
   * Get verification log
   */
  getVerificationLog(): Array<{timestamp: Date; action: string; result: string}> {
    return [...this.verificationLog];
  }

  private averageConfidence(sources: SourceReference[]): ConfidenceLevel {
    const confidenceScores = {
      [ConfidenceLevel.VERIFIED]: 5,
      [ConfidenceLevel.HIGH]: 4,
      [ConfidenceLevel.MEDIUM]: 3,
      [ConfidenceLevel.LOW]: 2,
      [ConfidenceLevel.UNCERTAIN]: 1
    };

    const avg = sources.reduce((sum, s) => sum + confidenceScores[s.confidence], 0) / sources.length;

    if (avg >= 4.5) return ConfidenceLevel.VERIFIED;
    if (avg >= 3.5) return ConfidenceLevel.HIGH;
    if (avg >= 2.5) return ConfidenceLevel.MEDIUM;
    if (avg >= 1.5) return ConfidenceLevel.LOW;
    return ConfidenceLevel.UNCERTAIN;
  }

  private logVerification(action: string, result: string): void {
    this.verificationLog.push({
      timestamp: new Date(),
      action,
      result
    });
  }
}

// ============================================================================
// Information Categorizer
// ============================================================================

export class InformationCategorizer {
  private tracker: SourceTracker;

  constructor(tracker: SourceTracker) {
    this.tracker = tracker;
  }

  /**
   * Categorize response content into verified, inferred, and uncertain
   */
  categorizeResponse(content: string): ResponseVerification {
    const statements = this.extractStatements(content);
    const verifiedFacts: VerifiedStatement[] = [];
    const inferences: VerifiedStatement[] = [];
    const uncertainties: VerifiedStatement[] = [];

    for (const statement of statements) {
      const sources = this.tracker.getSources(statement);
      const confidence = this.tracker.calculateConfidence(statement);

      const verifiedStatement: VerifiedStatement = {
        statement,
        sources,
        confidence,
        caveats: this.generateCaveats(sources, confidence)
      };

      if (confidence === ConfidenceLevel.VERIFIED || confidence === ConfidenceLevel.HIGH) {
        verifiedFacts.push(verifiedStatement);
      } else if (confidence === ConfidenceLevel.MEDIUM) {
        inferences.push(verifiedStatement);
      } else {
        uncertainties.push(verifiedStatement);
      }
    }

    return {
      verifiedFacts,
      inferences,
      uncertainties,
      overallConfidence: this.calculateOverallConfidence(verifiedFacts, inferences, uncertainties),
      needsUserConfirmation: uncertainties.length > 0
    };
  }

  /**
   * Generate appropriate caveats based on confidence
   */
  private generateCaveats(sources: SourceReference[], confidence: ConfidenceLevel): string[] {
    const caveats: string[] = [];

    if (confidence === ConfidenceLevel.LOW || confidence === ConfidenceLevel.UNCERTAIN) {
      caveats.push('この情報は確認が必要です');
    }

    if (sources.some(s => s.type === SourceType.INFERENCE)) {
      caveats.push('推測を含みます');
    }

    if (sources.some(s => s.type === SourceType.SPECULATION)) {
      caveats.push('仮説に基づいています');
    }

    if (sources.length === 0) {
      caveats.push('情報源が不明です');
    }

    return caveats;
  }

  private extractStatements(content: string): string[] {
    // Split content into individual statements
    return content
      .split(/[。.!?！？\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private calculateOverallConfidence(
    verified: VerifiedStatement[],
    inferred: VerifiedStatement[],
    uncertain: VerifiedStatement[]
  ): ConfidenceLevel {
    const total = verified.length + inferred.length + uncertain.length;
    if (total === 0) return ConfidenceLevel.UNCERTAIN;

    const verifiedRatio = verified.length / total;
    const uncertainRatio = uncertain.length / total;

    if (verifiedRatio >= 0.8) return ConfidenceLevel.HIGH;
    if (uncertainRatio >= 0.3) return ConfidenceLevel.LOW;
    return ConfidenceLevel.MEDIUM;
  }
}

// ============================================================================
// Verification Helpers
// ============================================================================

export class VerificationHelpers {
  /**
   * Create a source reference for file system verification
   */
  static createFileSystemSource(filePath: string): SourceReference {
    return {
      type: SourceType.PRIMARY,
      confidence: ConfidenceLevel.VERIFIED,
      description: 'ファイルシステムから直接確認',
      timestamp: new Date(),
      fileReference: filePath,
      verificationMethod: 'direct_file_access'
    };
  }

  /**
   * Create a source reference for API response
   */
  static createApiSource(endpoint: string, confidence: ConfidenceLevel = ConfidenceLevel.HIGH): SourceReference {
    return {
      type: SourceType.PRIMARY,
      confidence,
      description: 'API応答から取得',
      timestamp: new Date(),
      url: endpoint,
      verificationMethod: 'api_call'
    };
  }

  /**
   * Create a source reference for documentation
   */
  static createDocumentationSource(url: string): SourceReference {
    return {
      type: SourceType.SECONDARY,
      confidence: ConfidenceLevel.HIGH,
      description: '公式ドキュメントから参照',
      timestamp: new Date(),
      url,
      verificationMethod: 'documentation_reference'
    };
  }

  /**
   * Create a source reference for inference
   */
  static createInferenceSource(reasoning: string): SourceReference {
    return {
      type: SourceType.INFERENCE,
      confidence: ConfidenceLevel.MEDIUM,
      description: `推論: ${reasoning}`,
      timestamp: new Date(),
      verificationMethod: 'logical_inference'
    };
  }

  /**
   * Create a source reference for speculation
   */
  static createSpeculationSource(basis: string): SourceReference {
    return {
      type: SourceType.SPECULATION,
      confidence: ConfidenceLevel.LOW,
      description: `推測: ${basis}`,
      timestamp: new Date(),
      verificationMethod: 'educated_guess'
    };
  }

  /**
   * Format verification result for display
   */
  static formatVerificationResult(verification: ResponseVerification): string {
    let result = '';

    if (verification.verifiedFacts.length > 0) {
      result += '## 確認済み情報\n';
      verification.verifiedFacts.forEach(fact => {
        result += `- ${fact.statement}\n`;
        if (fact.sources.length > 0) {
          result += `  出典: ${fact.sources[0].description}\n`;
        }
      });
      result += '\n';
    }

    if (verification.inferences.length > 0) {
      result += '## 推測情報\n';
      verification.inferences.forEach(inference => {
        result += `- ${inference.statement}\n`;
        if (inference.caveats && inference.caveats.length > 0) {
          result += `  注意: ${inference.caveats.join(', ')}\n`;
        }
      });
      result += '\n';
    }

    if (verification.uncertainties.length > 0) {
      result += '## 未確認情報\n';
      verification.uncertainties.forEach(uncertainty => {
        result += `- ${uncertainty.statement}\n`;
        result += `  ⚠️ この情報は確認が必要です\n`;
      });
      result += '\n';
    }

    result += `\n総合信頼度: ${this.getConfidenceLabel(verification.overallConfidence)}\n`;

    return result;
  }

  private static getConfidenceLabel(confidence: ConfidenceLevel): string {
    const labels = {
      [ConfidenceLevel.VERIFIED]: '確認済み ✓',
      [ConfidenceLevel.HIGH]: '高',
      [ConfidenceLevel.MEDIUM]: '中',
      [ConfidenceLevel.LOW]: '低',
      [ConfidenceLevel.UNCERTAIN]: '不明'
    };
    return labels[confidence];
  }
}

// ============================================================================
// Usage Example
// ============================================================================

export function demonstrateVerification(): void {
  const tracker = new SourceTracker();
  const categorizer = new InformationCategorizer(tracker);

  // Add verified information
  const statement1 = 'このプロジェクトはTypeScriptで書かれています';
  tracker.addSource(statement1, VerificationHelpers.createFileSystemSource('tsconfig.json'));

  // Add inferred information
  const statement2 = 'このプロジェクトはWebアプリケーションです';
  tracker.addSource(statement2, VerificationHelpers.createInferenceSource(
    'package.jsonにwebpack依存関係が含まれているため'
  ));

  // Add uncertain information
  const statement3 = 'このプロジェクトは2024年に開始されました';
  tracker.addSource(statement3, VerificationHelpers.createSpeculationSource(
    'ファイルのタイムスタンプから推測'
  ));

  // Categorize response
  const content = `${statement1}。${statement2}。${statement3}。`;
  const verification = categorizer.categorizeResponse(content);

  // Display results
  console.log(VerificationHelpers.formatVerificationResult(verification));
  console.log('\n=== 検証ログ ===');
  tracker.getVerificationLog().forEach(log => {
    console.log(`[${log.timestamp.toISOString()}] ${log.action}: ${log.result}`);
  });
}

// Made with Bob
