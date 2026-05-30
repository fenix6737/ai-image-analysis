/**
 * Web Demo Entry Point
 * Browser-compatible version of the AI response system demos
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
  VerificationHelpers
} from './source-verification-system';

// Global state
let currentManager: StreamingResponseManager | null = null;
let isRunning = false;

// Utility function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Output management
function appendOutput(text: string, className?: string) {
  const output = document.getElementById('output');
  if (!output) return;

  const div = document.createElement('div');
  if (className) {
    div.className = className;
  }
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function setStatus(state: string, message: string) {
  const statusDiv = document.getElementById('status');
  if (!statusDiv) return;

  if (!state) {
    statusDiv.innerHTML = '';
    return;
  }

  const icons: Record<string, string> = {
    thinking: '🤔',
    analyzing: '🔍',
    searching: '🔎',
    generating: '✍️',
    verifying: '✓',
    completing: '✅'
  };

  statusDiv.innerHTML = `
    <div class="status-indicator ${state}">
      <span class="spinner"></span>
      <span>${icons[state] || '⏳'} ${message}</span>
    </div>
  `;
}

function clearOutput() {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = '';
  }
  setStatus('', '');
}

// Demo 1: Basic Streaming
async function basicStreamingDemo() {
  appendOutput('=== 基本的なストリーミング応答 ===\n');

  const manager = new StreamingResponseManager();
  currentManager = manager;

  manager.onStateChange((status) => {
    setStatus(status.state, status.message);
    appendOutput(`[${status.state}] ${status.message}`);
  });

  manager.onChunk((chunk) => {
    appendOutput(chunk.content, 'chunk');
  });

  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(500);

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
  setStatus('', '');
  appendOutput(`\n✅ 完了 (処理時間: ${metadata.endTime!.getTime() - metadata.startTime.getTime()}ms)`);
}

// Demo 2: File Analysis
async function fileAnalysisDemo() {
  appendOutput('=== ファイル分析と進行状況表示 ===\n');

  const manager = new StreamingResponseManager();
  const visualizer = new FileProcessingVisualizer(manager);
  currentManager = manager;

  manager.onStateChange((status) => {
    let output = `[${status.state}] ${status.message}`;
    if (status.details) output += ` - ${status.details}`;
    if (status.progress) output += ` (${status.progress.toFixed(0)}%)`;
    setStatus(status.state, status.message);
    appendOutput(output);
  });

  const files = [
    'src/main.ts',
    'src/components/Header.tsx',
    'src/utils/helpers.ts',
    'package.json',
    'tsconfig.json'
  ];

  await visualizer.analyzeFiles(files);

  manager.setState(ProcessingState.GENERATING, '分析結果を生成中…');
  await delay(500);

  const results = [
    'ファイル分析が完了しました。',
    'TypeScriptプロジェクトであることを確認しました。',
    'Reactコンポーネントが含まれています。',
    'プロジェクト構成は適切です。'
  ];

  for (const result of results) {
    await delay(300);
    appendOutput(result, 'chunk');
  }

  manager.complete();
  setStatus('', '');
  appendOutput('\n✅ 完了');
}

// Demo 3: Verification
async function verificationDemo() {
  appendOutput('=== 情報源の検証 ===\n');

  const manager = new StreamingResponseManager();
  const tracker = new SourceTracker();
  const categorizer = new InformationCategorizer(tracker);
  currentManager = manager;

  manager.onStateChange((status) => {
    setStatus(status.state, status.message);
    appendOutput(`[${status.state}] ${status.message}`);
  });

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

  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(400);

  manager.setState(ProcessingState.VERIFYING, '情報源を確認中…');
  await delay(500);

  manager.setState(ProcessingState.GENERATING, '応答を生成中…');
  await delay(300);

  appendOutput(statement1, 'chunk');
  await delay(300);
  appendOutput(statement2, 'chunk');
  await delay(300);
  appendOutput(statement3, 'chunk');

  manager.complete();
  setStatus('', '');

  const fullResponse = `${statement1}。${statement2}。${statement3}。`;
  const verification = categorizer.categorizeResponse(fullResponse);

  appendOutput('\n--- 検証結果 ---');
  appendOutput(VerificationHelpers.formatVerificationResult(verification));
}

// Demo 4: Uncertain Information
async function uncertainInformationDemo() {
  appendOutput('=== 不確実な情報の扱い ===\n');

  const manager = new StreamingResponseManager();
  currentManager = manager;

  manager.onStateChange((status) => {
    setStatus(status.state, status.message);
    appendOutput(`[${status.state}] ${status.message}`);
  });

  manager.setState(ProcessingState.THINKING, '思考中…');
  await delay(400);

  manager.setState(ProcessingState.SEARCHING, '情報を検索中…');
  await delay(600);

  manager.setState(ProcessingState.VERIFYING, '情報源を確認中…');
  await delay(500);

  manager.setState(ProcessingState.GENERATING, '応答を生成中…');
  await delay(300);

  const responses = [
    '申し訳ございませんが、この質問に対する確実な情報を確認できませんでした。',
    '以下の理由により、確実な回答を提供できません:',
    '1. 信頼できる情報源が見つかりませんでした',
    '2. 利用可能なデータが不十分です',
    'より具体的な情報をご提供いただければ、お答えできる可能性があります。'
  ];

  for (const response of responses) {
    await delay(400);
    appendOutput(response, 'chunk');
  }

  manager.complete();
  setStatus('', '');
  appendOutput('\n✅ 完了');
}

// Demo 5: Complex Task
async function complexTaskDemo() {
  appendOutput('=== 複雑なマルチステップタスク ===\n');

  const manager = new StreamingResponseManager();
  const visualizer = new FileProcessingVisualizer(manager);
  const tracker = new SourceTracker();
  currentManager = manager;

  manager.onStateChange((status) => {
    let output = `[${status.state}] ${status.message}`;
    if (status.details) output += ` - ${status.details}`;
    setStatus(status.state, status.message);
    appendOutput(output);
  });

  await visualizer.analyzeFiles(['src/app.ts', 'package.json']);
  await visualizer.verifyInformation('TypeScript best practices');

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
    appendOutput(insight, 'chunk');

    if (insight.includes('TypeScript 5.0')) {
      tracker.addSource(
        insight,
        VerificationHelpers.createFileSystemSource('package.json')
      );
    }
  }

  const metadata = manager.complete();
  setStatus('', '');

  appendOutput('\n--- メタデータ ---');
  appendOutput(`処理時間: ${metadata.endTime!.getTime() - metadata.startTime.getTime()}ms`);
  appendOutput(`総チャンク数: ${metadata.totalChunks}`);
  appendOutput(`処理ステップ: ${metadata.processingSteps.join(' → ')}`);
}

// Main demo runner
async function runDemo(demoType: string) {
  if (isRunning) {
    alert('デモが実行中です。完了するまでお待ちください。');
    return;
  }

  isRunning = true;
  clearOutput();

  try {
    switch (demoType) {
      case 'basic':
        await basicStreamingDemo();
        break;
      case 'fileAnalysis':
        await fileAnalysisDemo();
        break;
      case 'verification':
        await verificationDemo();
        break;
      case 'uncertain':
        await uncertainInformationDemo();
        break;
      case 'complex':
        await complexTaskDemo();
        break;
      default:
        appendOutput('不明なデモタイプです');
    }
  } catch (error) {
    appendOutput(`\n❌ エラーが発生しました: ${error}`);
    console.error(error);
  } finally {
    isRunning = false;
  }
}

// Expose functions to global scope
(window as any).runDemo = runDemo;
(window as any).clearOutput = clearOutput;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('AI応答システム デモ準備完了');
});

// Made with Bob