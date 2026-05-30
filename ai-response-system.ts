/**
 * AI Response System - Streaming Response Handler
 * 
 * This system implements progressive, sentence-by-sentence response display
 * with visible processing states to create a natural, trustworthy AI experience.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum ProcessingState {
  THINKING = 'thinking',
  ANALYZING = 'analyzing',
  SEARCHING = 'searching',
  GENERATING = 'generating',
  VERIFYING = 'verifying',
  COMPLETING = 'completing',
  IDLE = 'idle'
}

export interface ResponseChunk {
  content: string;
  timestamp: Date;
  state?: ProcessingState;
}

export interface ProcessingStatus {
  state: ProcessingState;
  message: string;
  progress?: number;
  details?: string;
}

export interface SourceInfo {
  type: 'verified' | 'unverified' | 'inference';
  source?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ResponseMetadata {
  startTime: Date;
  endTime?: Date;
  totalChunks: number;
  sources: SourceInfo[];
  processingSteps: ProcessingState[];
}

// ============================================================================
// Streaming Response Manager
// ============================================================================

export class StreamingResponseManager {
  private currentState: ProcessingState = ProcessingState.IDLE;
  private chunks: ResponseChunk[] = [];
  private metadata: ResponseMetadata;
  private stateChangeCallbacks: ((status: ProcessingStatus) => void)[] = [];
  private chunkCallbacks: ((chunk: ResponseChunk) => void)[] = [];

  constructor() {
    this.metadata = {
      startTime: new Date(),
      totalChunks: 0,
      sources: [],
      processingSteps: []
    };
  }

  /**
   * Register callback for state changes
   */
  onStateChange(callback: (status: ProcessingStatus) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Register callback for new chunks
   */
  onChunk(callback: (chunk: ResponseChunk) => void): void {
    this.chunkCallbacks.push(callback);
  }

  /**
   * Update processing state with optional details
   */
  setState(state: ProcessingState, message: string, details?: string, progress?: number): void {
    this.currentState = state;
    this.metadata.processingSteps.push(state);

    const status: ProcessingStatus = {
      state,
      message,
      details,
      progress
    };

    this.stateChangeCallbacks.forEach(callback => callback(status));
  }

  /**
   * Add a response chunk (sentence or paragraph)
   */
  addChunk(content: string, state?: ProcessingState): void {
    const chunk: ResponseChunk = {
      content,
      timestamp: new Date(),
      state: state || this.currentState
    };

    this.chunks.push(chunk);
    this.metadata.totalChunks++;

    this.chunkCallbacks.forEach(callback => callback(chunk));
  }

  /**
   * Add source information for transparency
   */
  addSource(source: SourceInfo): void {
    this.metadata.sources.push(source);
  }

  /**
   * Complete the response
   */
  complete(): ResponseMetadata {
    this.metadata.endTime = new Date();
    this.setState(ProcessingState.IDLE, '完了');
    return this.metadata;
  }

  /**
   * Get current metadata
   */
  getMetadata(): ResponseMetadata {
    return { ...this.metadata };
  }

  /**
   * Reset for new response
   */
  reset(): void {
    this.currentState = ProcessingState.IDLE;
    this.chunks = [];
    this.metadata = {
      startTime: new Date(),
      totalChunks: 0,
      sources: [],
      processingSteps: []
    };
  }
}

// ============================================================================
// Text Chunking Utilities
// ============================================================================

export class TextChunker {
  /**
   * Split text into sentences for progressive display
   */
  static splitIntoSentences(text: string): string[] {
    // Japanese and English sentence splitting
    const sentences: string[] = [];
    
    // Split by common sentence endings
    const parts = text.split(/([。！？\.!?]+[\s\n]*)/);
    
    let currentSentence = '';
    for (let i = 0; i < parts.length; i++) {
      currentSentence += parts[i];
      
      // If this is a sentence ending, push and reset
      if (i % 2 === 1 && currentSentence.trim()) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
    }
    
    // Add any remaining text
    if (currentSentence.trim()) {
      sentences.push(currentSentence.trim());
    }
    
    return sentences.filter(s => s.length > 0);
  }

  /**
   * Split text into natural chunks (paragraphs or logical units)
   */
  static splitIntoChunks(text: string, maxChunkSize: number = 200): string[] {
    const sentences = this.splitIntoSentences(text);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

// ============================================================================
// File Processing Visualizer
// ============================================================================

export class FileProcessingVisualizer {
  private manager: StreamingResponseManager;

  constructor(manager: StreamingResponseManager) {
    this.manager = manager;
  }

  /**
   * Visualize file analysis process
   */
  async analyzeFiles(filePaths: string[]): Promise<void> {
    this.manager.setState(
      ProcessingState.THINKING,
      '思考中…'
    );
    await this.delay(300);

    this.manager.setState(
      ProcessingState.ANALYZING,
      'ファイルを確認中…',
      `対象: ${filePaths.length}件`
    );
    await this.delay(500);

    for (let i = 0; i < filePaths.length; i++) {
      const fileName = filePaths[i].split('/').pop() || filePaths[i];
      this.manager.setState(
        ProcessingState.ANALYZING,
        '内容を解析中…',
        `${fileName} (${i + 1}/${filePaths.length})`,
        ((i + 1) / filePaths.length) * 100
      );
      await this.delay(400);
    }
  }

  /**
   * Visualize content generation process
   */
  async generateContent(description: string): Promise<void> {
    this.manager.setState(
      ProcessingState.GENERATING,
      '生成中…',
      description
    );
    await this.delay(600);
  }

  /**
   * Visualize search/verification process
   */
  async verifyInformation(query: string): Promise<void> {
    this.manager.setState(
      ProcessingState.SEARCHING,
      '情報を検索中…',
      query
    );
    await this.delay(500);

    this.manager.setState(
      ProcessingState.VERIFYING,
      '情報源を確認中…'
    );
    await this.delay(400);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Response Quality Controller
// ============================================================================

export class ResponseQualityController {
  /**
   * Validate response meets quality standards
   */
  static validateResponse(response: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for vague language
    const vaguePatterns = [
      /おそらく|たぶん|かもしれません|と思われます/g,
      /probably|maybe|perhaps|might be/gi
    ];

    vaguePatterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches && matches.length > 2) {
        issues.push('過度に曖昧な表現が含まれています');
      }
    });

    // Check for minimum content length
    if (response.trim().length < 10) {
      issues.push('応答が短すぎます');
    }

    // Check for proper sentence structure
    if (!response.match(/[。.!?！？]/)) {
      issues.push('適切な文末記号がありません');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Separate verified facts from inferences
   */
  static categorizeInformation(text: string): {
    verified: string[];
    inferred: string[];
    uncertain: string[];
  } {
    // This is a simplified implementation
    // In production, this would use NLP and fact-checking
    return {
      verified: [],
      inferred: [],
      uncertain: []
    };
  }
}

// ============================================================================
// Usage Example
// ============================================================================

export async function demonstrateUsage(): Promise<void> {
  const manager = new StreamingResponseManager();
  const visualizer = new FileProcessingVisualizer(manager);

  // Register callbacks for UI updates
  manager.onStateChange((status) => {
    console.log(`[${status.state}] ${status.message}`);
    if (status.details) console.log(`  詳細: ${status.details}`);
    if (status.progress) console.log(`  進捗: ${status.progress.toFixed(1)}%`);
  });

  manager.onChunk((chunk) => {
    console.log(`[CHUNK] ${chunk.content}`);
  });

  // Simulate file analysis
  await visualizer.analyzeFiles([
    'src/main.ts',
    'src/utils.ts',
    'config.json'
  ]);

  // Generate response in chunks
  const fullResponse = `
    ファイルの解析が完了しました。
    3つのファイルを確認し、TypeScriptプロジェクトであることを確認しました。
    main.tsにはアプリケーションのエントリーポイントが含まれています。
    utils.tsには補助関数が定義されています。
    設定ファイルは適切に構成されています。
  `;

  const sentences = TextChunker.splitIntoSentences(fullResponse);
  
  manager.setState(ProcessingState.GENERATING, '応答を生成中…');
  
  for (const sentence of sentences) {
    await new Promise(resolve => setTimeout(resolve, 300));
    manager.addChunk(sentence);
  }

  // Add source information
  manager.addSource({
    type: 'verified',
    source: 'ファイルシステム直接確認',
    confidence: 'high'
  });

  // Complete
  const metadata = manager.complete();
  console.log('\n=== 完了 ===');
  console.log(`処理時間: ${metadata.endTime!.getTime() - metadata.startTime.getTime()}ms`);
  console.log(`チャンク数: ${metadata.totalChunks}`);
  console.log(`処理ステップ: ${metadata.processingSteps.join(' → ')}`);
}

// Made with Bob
