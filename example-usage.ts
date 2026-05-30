/**
 * Example Usage and Integration Guide
 * 
 * Demonstrates how to use the AI response system with streaming,
 * verification, and UI components.
 */

import {
  StreamingResponseManager,
  TextChunker,
  FileProcessingVisualizer,
  ProcessingState
} from './ai-response-system';

import {
  SourceTracker,
  InformationCategorizer,
  VerificationHelpers,
  SourceType,
  ConfidenceLevel
} from './source-verification-system';

// ============================================================================
// Example 1: Basic Streaming Response
// ============================================================================

export async function basicStreamingExample() {
  console.log('=== Example 1: Basic Streaming Response ===\n');

  const manager = new StreamingResponseManager();

  // Register callbacks for UI updates
  manager.onStateChange((status) => {
    console.log(`[${status.state}] ${status.message}`);
    if (status.details) console.log(`  └─ ${status.details}`);
  });

  manager.onChunk((chunk) => {
    console.log(`  ${chunk.content}`);
  });

  // Start thinking
  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(500);

  // Generate response sentence by sentence
  const response = `
    ご質問ありがとうございます。
    TypeScriptは、JavaScriptに静的型付けを追加したプログラミング言語です。
    Microsoftによって開発され、大規模なアプリケーション開発に適しています。
    型安全性により、開発時のエラーを早期に発見できます。
  `;

  manager.setState(ProcessingState.GENERATING, '応答を生成中…');

  const sentences = TextChunker.splitIntoSentences(response);
  for (const sentence of sentences) {
    await delay(400);
    manager.addChunk(sentence);
  }

  const metadata = manager.complete();
  console.log('\n完了');
  console.log(`処理時間: ${metadata.endTime!.getTime() - metadata.startTime.getTime()}ms`);
  console.log(`チャンク数: ${metadata.totalChunks}\n`);
}

// ============================================================================
// Example 2: File Analysis with Progress Visualization
// ============================================================================

export async function fileAnalysisExample() {
  console.log('=== Example 2: File Analysis with Progress ===\n');

  const manager = new StreamingResponseManager();
  const visualizer = new FileProcessingVisualizer(manager);

  manager.onStateChange((status) => {
    let output = `[${status.state}] ${status.message}`;
    if (status.details) output += ` - ${status.details}`;
    if (status.progress) output += ` (${status.progress.toFixed(0)}%)`;
    console.log(output);
  });

  // Simulate file analysis
  const files = [
    'src/main.ts',
    'src/components/Header.tsx',
    'src/utils/helpers.ts',
    'package.json',
    'tsconfig.json'
  ];

  await visualizer.analyzeFiles(files);

  // Generate analysis result
  manager.setState(ProcessingState.GENERATING, '分析結果を生成中…');
  await delay(500);

  manager.addChunk('ファイル分析が完了しました。');
  await delay(300);
  manager.addChunk('TypeScriptプロジェクトであることを確認しました。');
  await delay(300);
  manager.addChunk('Reactコンポーネントが含まれています。');
  await delay(300);
  manager.addChunk('プロジェクト構成は適切です。');

  manager.complete();
  console.log('\n完了\n');
}

// ============================================================================
// Example 3: Response with Source Verification
// ============================================================================

export async function verificationExample() {
  console.log('=== Example 3: Response with Source Verification ===\n');

  const manager = new StreamingResponseManager();
  const tracker = new SourceTracker();
  const categorizer = new InformationCategorizer(tracker);

  manager.onStateChange((status) => {
    console.log(`[${status.state}] ${status.message}`);
  });

  // Add statements with different confidence levels
  const statement1 = 'このファイルはTypeScriptで書かれています';
  tracker.addSource(
    statement1,
    VerificationHelpers.createFileSystemSource('src/main.ts')
  );

  const statement2 = 'このプロジェクトはWebアプリケーションです';
  tracker.addSource(
    statement2,
    VerificationHelpers.createInferenceSource('package.jsonにreact依存関係があるため')
  );

  const statement3 = 'このプロジェクトは本番環境で使用されています';
  tracker.addSource(
    statement3,
    VerificationHelpers.createSpeculationSource('ファイル構成から推測')
  );

  // Generate response
  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(400);

  manager.setState(ProcessingState.VERIFYING, '情報源を確認中…');
  await delay(500);

  manager.setState(ProcessingState.GENERATING, '応答を生成中…');
  await delay(300);

  manager.addChunk(statement1);
  await delay(300);
  manager.addChunk(statement2);
  await delay(300);
  manager.addChunk(statement3);

  manager.complete();

  // Display verification results
  const fullResponse = `${statement1}。${statement2}。${statement3}。`;
  const verification = categorizer.categorizeResponse(fullResponse);

  console.log('\n--- 検証結果 ---');
  console.log(VerificationHelpers.formatVerificationResult(verification));
}

// ============================================================================
// Example 4: Handling Uncertain Information
// ============================================================================

export async function uncertainInformationExample() {
  console.log('=== Example 4: Handling Uncertain Information ===\n');

  const manager = new StreamingResponseManager();
  const tracker = new SourceTracker();

  manager.onStateChange((status) => {
    console.log(`[${status.state}] ${status.message}`);
  });

  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(400);

  manager.setState(ProcessingState.SEARCHING, '情報を検索中…');
  await delay(600);

  // Simulate finding no reliable source
  manager.setState(ProcessingState.VERIFYING, '情報源を確認中…');
  await delay(500);

  manager.setState(ProcessingState.GENERATING, '応答を生成中…');
  await delay(300);

  // Provide honest response about uncertainty
  manager.addChunk('申し訳ございませんが、この質問に対する確実な情報を確認できませんでした。');
  await delay(400);
  manager.addChunk('以下の理由により、確実な回答を提供できません:');
  await delay(400);
  manager.addChunk('1. 信頼できる情報源が見つかりませんでした');
  await delay(400);
  manager.addChunk('2. 利用可能なデータが不十分です');
  await delay(400);
  manager.addChunk('より具体的な情報をご提供いただければ、お答えできる可能性があります。');

  manager.complete();
  console.log('\n完了\n');
}

// ============================================================================
// Example 5: Complex Multi-Step Task
// ============================================================================

export async function complexTaskExample() {
  console.log('=== Example 5: Complex Multi-Step Task ===\n');

  const manager = new StreamingResponseManager();
  const visualizer = new FileProcessingVisualizer(manager);
  const tracker = new SourceTracker();

  manager.onStateChange((status) => {
    let output = `[${status.state}] ${status.message}`;
    if (status.details) output += ` - ${status.details}`;
    console.log(output);
  });

  manager.onChunk((chunk) => {
    console.log(`  ${chunk.content}`);
  });

  // Step 1: Analyze files
  await visualizer.analyzeFiles(['src/app.ts', 'package.json']);

  // Step 2: Search for information
  await visualizer.verifyInformation('TypeScript best practices');

  // Step 3: Generate comprehensive response
  manager.setState(ProcessingState.GENERATING, '詳細な分析結果を生成中…');
  await delay(500);

  const insights = [
    'プロジェクト分析が完了しました。',
    'TypeScript 5.0を使用していることを確認しました。',
    '推奨される改善点をいくつか発見しました。',
    '1. strict モードを有効にすることをお勧めします。',
    '2. ESLint設定を最新化できます。',
    '3. 型定義の一部を改善できます。',
    'これらの改善により、コード品質が向上します。'
  ];

  for (const insight of insights) {
    await delay(350);
    manager.addChunk(insight);
    
    // Add source for verified statements
    if (insight.includes('TypeScript 5.0')) {
      tracker.addSource(
        insight,
        VerificationHelpers.createFileSystemSource('package.json')
      );
    }
  }

  const metadata = manager.complete();
  
  console.log('\n--- メタデータ ---');
  console.log(`処理時間: ${metadata.endTime!.getTime() - metadata.startTime.getTime()}ms`);
  console.log(`総チャンク数: ${metadata.totalChunks}`);
  console.log(`処理ステップ: ${metadata.processingSteps.join(' → ')}`);
  console.log(`情報源: ${metadata.sources.length}件\n`);
}

// ============================================================================
// Example 6: Quality Validation
// ============================================================================

export async function qualityValidationExample() {
  console.log('=== Example 6: Quality Validation ===\n');

  const manager = new StreamingResponseManager();

  // Good response
  const goodResponse = 'TypeScriptは静的型付けを提供します。これにより開発時のエラーを防げます。';
  
  // Poor response (too vague)
  const poorResponse = 'たぶんTypeScriptは良いと思います。おそらく使えるかもしれません。';

  console.log('良い応答の例:');
  console.log(`"${goodResponse}"\n`);

  console.log('改善が必要な応答の例:');
  console.log(`"${poorResponse}"`);
  console.log('→ 曖昧な表現が多すぎます\n');

  // Demonstrate proper response generation
  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(400);

  manager.setState(ProcessingState.GENERATING, '高品質な応答を生成中…');
  await delay(500);

  const sentences = TextChunker.splitIntoSentences(goodResponse);
  for (const sentence of sentences) {
    await delay(300);
    manager.addChunk(sentence);
  }

  manager.complete();
  console.log('\n完了\n');
}

// ============================================================================
// Utility Functions
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples() {
  await basicStreamingExample();
  await delay(1000);
  
  await fileAnalysisExample();
  await delay(1000);
  
  await verificationExample();
  await delay(1000);
  
  await uncertainInformationExample();
  await delay(1000);
  
  await complexTaskExample();
  await delay(1000);
  
  await qualityValidationExample();
  
  console.log('=== All Examples Completed ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Made with Bob
