/**
 * UI State Manager - React Components
 * 
 * Provides React components for displaying streaming responses,
 * processing states, and verification information with natural UX.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StreamingResponseManager,
  ProcessingState,
  ProcessingStatus,
  ResponseChunk,
  ResponseMetadata
} from './ai-response-system';
import {
  SourceTracker,
  InformationCategorizer,
  ResponseVerification,
  ConfidenceLevel,
  VerificationHelpers
} from './source-verification-system';

// ============================================================================
// Types
// ============================================================================

interface StreamingResponseProps {
  manager: StreamingResponseManager;
  showMetadata?: boolean;
  animationDelay?: number;
}

interface ProcessingIndicatorProps {
  status: ProcessingStatus;
  compact?: boolean;
}

interface VerificationDisplayProps {
  verification: ResponseVerification;
  expanded?: boolean;
}

// ============================================================================
// Processing State Indicator Component
// ============================================================================

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  status,
  compact = false
}) => {
  const getStateIcon = (state: ProcessingState): string => {
    const icons = {
      [ProcessingState.THINKING]: '🤔',
      [ProcessingState.ANALYZING]: '🔍',
      [ProcessingState.SEARCHING]: '🔎',
      [ProcessingState.GENERATING]: '✍️',
      [ProcessingState.VERIFYING]: '✓',
      [ProcessingState.COMPLETING]: '✅',
      [ProcessingState.IDLE]: ''
    };
    return icons[state] || '⏳';
  };

  const getStateColor = (state: ProcessingState): string => {
    const colors = {
      [ProcessingState.THINKING]: '#6366f1',
      [ProcessingState.ANALYZING]: '#8b5cf6',
      [ProcessingState.SEARCHING]: '#ec4899',
      [ProcessingState.GENERATING]: '#10b981',
      [ProcessingState.VERIFYING]: '#f59e0b',
      [ProcessingState.COMPLETING]: '#22c55e',
      [ProcessingState.IDLE]: '#6b7280'
    };
    return colors[state] || '#6b7280';
  };

  if (status.state === ProcessingState.IDLE) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: compact ? '4px 8px' : '8px 12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: compact ? '12px' : '14px',
        color: '#374151',
        marginBottom: compact ? '4px' : '8px'
      }}
    >
      <span
        style={{
          fontSize: compact ? '14px' : '16px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      >
        {getStateIcon(status.state)}
      </span>
      <span style={{ fontWeight: 500 }}>{status.message}</span>
      {status.details && !compact && (
        <span style={{ color: '#6b7280', fontSize: '12px' }}>
          {status.details}
        </span>
      )}
      {status.progress !== undefined && (
        <div
          style={{
            marginLeft: 'auto',
            width: '60px',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${status.progress}%`,
              height: '100%',
              backgroundColor: getStateColor(status.state),
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Streaming Response Display Component
// ============================================================================

export const StreamingResponseDisplay: React.FC<StreamingResponseProps> = ({
  manager,
  showMetadata = false,
  animationDelay = 50
}) => {
  const [chunks, setChunks] = useState<ResponseChunk[]>([]);
  const [currentStatus, setCurrentStatus] = useState<ProcessingStatus | null>(null);
  const [metadata, setMetadata] = useState<ResponseMetadata | null>(null);
  const [visibleChunks, setVisibleChunks] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register callbacks
    const handleChunk = (chunk: ResponseChunk) => {
      setChunks(prev => [...prev, chunk]);
    };

    const handleStateChange = (status: ProcessingStatus) => {
      setCurrentStatus(status);
    };

    manager.onChunk(handleChunk);
    manager.onStateChange(handleStateChange);

    return () => {
      // Cleanup would go here in production
    };
  }, [manager]);

  // Animate chunks appearing one by one
  useEffect(() => {
    if (visibleChunks < chunks.length) {
      const timer = setTimeout(() => {
        setVisibleChunks(prev => prev + 1);
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [chunks.length, visibleChunks, animationDelay]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleChunks]);

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      {currentStatus && <ProcessingIndicator status={currentStatus} />}

      <div
        ref={containerRef}
        style={{
          maxHeight: '600px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        {chunks.slice(0, visibleChunks).map((chunk, index) => (
          <div
            key={index}
            style={{
              marginBottom: '12px',
              lineHeight: '1.6',
              color: '#1f2937',
              animation: 'fadeIn 0.3s ease-in',
              opacity: 1
            }}
          >
            {chunk.content}
          </div>
        ))}
      </div>

      {showMetadata && metadata && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#6b7280'
          }}
        >
          <div>処理時間: {metadata.endTime && metadata.startTime ? 
            `${metadata.endTime.getTime() - metadata.startTime.getTime()}ms` : '処理中'}</div>
          <div>チャンク数: {metadata.totalChunks}</div>
          <div>情報源: {metadata.sources.length}件</div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Verification Display Component
// ============================================================================

export const VerificationDisplay: React.FC<VerificationDisplayProps> = ({
  verification,
  expanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    const styles = {
      [ConfidenceLevel.VERIFIED]: { bg: '#dcfce7', color: '#166534', label: '確認済み' },
      [ConfidenceLevel.HIGH]: { bg: '#dbeafe', color: '#1e40af', label: '高信頼' },
      [ConfidenceLevel.MEDIUM]: { bg: '#fef3c7', color: '#92400e', label: '中信頼' },
      [ConfidenceLevel.LOW]: { bg: '#fee2e2', color: '#991b1b', label: '低信頼' },
      [ConfidenceLevel.UNCERTAIN]: { bg: '#f3f4f6', color: '#374151', label: '不明' }
    };

    const style = styles[confidence];

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color
        }}
      >
        {style.label}
      </span>
    );
  };

  return (
    <div
      style={{
        marginTop: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
            情報の信頼性
          </span>
          {getConfidenceBadge(verification.overallConfidence)}
        </div>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {verification.verifiedFacts.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#059669', marginBottom: '8px' }}>
                ✓ 確認済み情報 ({verification.verifiedFacts.length})
              </h4>
              {verification.verifiedFacts.map((fact, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f0fdf4',
                    borderLeft: '3px solid #10b981',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: '#065f46'
                  }}
                >
                  {fact.statement}
                  {fact.sources.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      出典: {fact.sources[0].description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {verification.inferences.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#d97706', marginBottom: '8px' }}>
                ⚡ 推測情報 ({verification.inferences.length})
              </h4>
              {verification.inferences.map((inference, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fffbeb',
                    borderLeft: '3px solid #f59e0b',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: '#92400e'
                  }}
                >
                  {inference.statement}
                  {inference.caveats && inference.caveats.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      注意: {inference.caveats.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {verification.uncertainties.length > 0 && (
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>
                ⚠️ 未確認情報 ({verification.uncertainties.length})
              </h4>
              {verification.uncertainties.map((uncertainty, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    borderLeft: '3px solid #ef4444',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: '#991b1b'
                  }}
                >
                  {uncertainty.statement}
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                    この情報は確認が必要です
                  </div>
                </div>
              ))}
            </div>
          )}

          {verification.needsUserConfirmation && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#92400e'
              }}
            >
              ⚠️ 一部の情報は確認が必要です。重要な判断を行う前に、追加の確認をお勧めします。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Complete AI Response Component
// ============================================================================

interface AIResponseProps {
  manager: StreamingResponseManager;
  tracker: SourceTracker;
  showVerification?: boolean;
  showMetadata?: boolean;
}

export const AIResponse: React.FC<AIResponseProps> = ({
  manager,
  tracker,
  showVerification = true,
  showMetadata = false
}) => {
  const [verification, setVerification] = useState<ResponseVerification | null>(null);

  useEffect(() => {
    // When response completes, generate verification
    const handleComplete = () => {
      const categorizer = new InformationCategorizer(tracker);
      const metadata = manager.getMetadata();
      
      // Combine all chunks into full response
      const fullResponse = metadata.totalChunks > 0 ? 'Response content' : '';
      
      if (fullResponse) {
        const verificationResult = categorizer.categorizeResponse(fullResponse);
        setVerification(verificationResult);
      }
    };

    // In production, this would be triggered by actual completion event
    // For now, we'll check periodically
    const interval = setInterval(() => {
      const metadata = manager.getMetadata();
      if (metadata.endTime && !verification) {
        handleComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [manager, tracker, verification]);

  return (
    <div style={{ padding: '20px' }}>
      <StreamingResponseDisplay
        manager={manager}
        showMetadata={showMetadata}
      />
      
      {showVerification && verification && (
        <VerificationDisplay verification={verification} />
      )}
    </div>
  );
};

// ============================================================================
// Hook for Managing AI Response State
// ============================================================================

export function useAIResponse() {
  const [manager] = useState(() => new StreamingResponseManager());
  const [tracker] = useState(() => new SourceTracker());

  const startResponse = () => {
    manager.reset();
  };

  const addVerifiedStatement = (statement: string, source: any) => {
    tracker.addSource(statement, source);
  };

  const completeResponse = () => {
    return manager.complete();
  };

  return {
    manager,
    tracker,
    startResponse,
    addVerifiedStatement,
    completeResponse
  };
}

// Made with Bob
