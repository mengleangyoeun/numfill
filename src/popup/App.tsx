import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  FieldInfo,
  DetectFieldsResponse,
  FillFieldsResponse,
  ClearFieldsResponse,
} from '../types';
import { parseNumbers } from '../utils/parser';
import {
  sendMessageToActiveTab,
  getActiveTab,
  isExtensionEnvironment,
} from '../utils/messaging';
import { Header } from '../components/Header';
import { StatusBanner, type StatusType } from '../components/StatusBanner';
import { FieldPreview } from '../components/FieldPreview';
import { RandomGenerator } from '../components/RandomGenerator';

type ActiveMode = 'random' | 'manual';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ActiveMode>('random');
  const [rawNumbers, setRawNumbers] = useState('');
  const [detectedFields, setDetectedFields] = useState<FieldInfo[]>([]);
  const [detectedCount, setDetectedCount] = useState<number>(0);
  const [currentHost, setCurrentHost] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isFilling, setIsFilling] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    type: StatusType;
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  const parsedNumbers = useMemo(() => parseNumbers(rawNumbers), [rawNumbers]);

  // Initial passive scan on mount (pure in-memory, no disk storage)
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const isExt = isExtensionEnvironment();
        if (!isExt) {
          setCurrentHost('Preview Tab');
        }

        const tab = await getActiveTab();
        if (!isMounted) return;

        if (tab.url && isExt) {
          try {
            const urlObj = new URL(tab.url);
            setCurrentHost(urlObj.hostname);
          } catch {
            setCurrentHost(tab.title || '');
          }
        }

        const response = await sendMessageToActiveTab<DetectFieldsResponse>({
          action: 'DETECT_FIELDS',
          highlight: false,
        });

        if (isMounted && response?.success) {
          setDetectedCount(response.count);
          setDetectedFields(response.fields);
        }
      } catch (err) {
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Could not connect to active tab.';
        setStatus({
          type: 'info',
          message: msg,
        });
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Scan & temporary highlight trigger
  const handleDetect = useCallback(async () => {
    setIsDetecting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await sendMessageToActiveTab<DetectFieldsResponse>({
        action: 'DETECT_FIELDS',
        highlight: true,
      });

      if (response.success) {
        setDetectedCount(response.count);
        setDetectedFields(response.fields);

        if (response.count === 0) {
          setStatus({
            type: 'warning',
            message: 'No visible editable inputs found.',
          });
        } else {
          setStatus({
            type: 'info',
            message: `Highlighted ${response.count} input${response.count === 1 ? '' : 's'} on page.`,
          });
        }
      } else {
        setStatus({
          type: 'error',
          message: response.error || 'Detection failed.',
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Could not scan tab. Refresh page.',
      });
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Core sequential fill executor
  const handleFill = useCallback(
    async (valuesToFill: string[]) => {
      if (valuesToFill.length === 0) {
        setStatus({
          type: 'warning',
          message: 'Please provide at least one number to fill.',
        });
        return;
      }

      setIsFilling(true);
      setStatus({ type: 'idle', message: '' });

      try {
        const response = await sendMessageToActiveTab<FillFieldsResponse>({
          action: 'FILL_FIELDS',
          values: valuesToFill,
          highlight: true,
        });

        if (response.success) {
          setDetectedCount(response.totalInputsDetected);

          if (response.filledCount === 0) {
            setStatus({
              type: 'warning',
              message: 'No editable fields found to fill.',
            });
          } else if (response.unusedValuesCount > 0) {
            setStatus({
              type: 'warning',
              message: `Filled ${response.filledCount} fields (${response.unusedValuesCount} unused).`,
            });
          } else if (response.remainingInputsCount > 0) {
            setStatus({
              type: 'info',
              message: `Filled ${response.filledCount} fields (${response.remainingInputsCount} remaining).`,
            });
          } else {
            setStatus({
              type: 'success',
              message: `✓ Filled all ${response.filledCount} fields!`,
            });
          }
        } else {
          setStatus({
            type: 'error',
            message: response.error || 'Failed to fill fields.',
          });
        }
      } catch (err) {
        setStatus({
          type: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Error executing fill in active tab.',
        });
      } finally {
        setIsFilling(false);
      }
    },
    []
  );

  // Clear inputs on webpage and reset in-memory text
  const handleClear = useCallback(async () => {
    setIsClearing(true);
    setStatus({ type: 'idle', message: '' });

    try {
      let pageCleared = 0;
      try {
        const res = await sendMessageToActiveTab<ClearFieldsResponse>({
          action: 'CLEAR_FIELDS',
        });
        if (res?.success) {
          pageCleared = res.clearedCount;
        }
      } catch (err) {
        console.warn('Page clear error:', err);
      }

      setRawNumbers('');

      if (pageCleared > 0) {
        setStatus({
          type: 'info',
          message: `✓ Cleared ${pageCleared} field${pageCleared === 1 ? '' : 's'} on page.`,
        });
      } else {
        setStatus({
          type: 'info',
          message: 'Inputs cleared.',
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to clear fields.',
      });
    } finally {
      setIsClearing(false);
    }
  }, []);

  // Send random numbers to manual textarea editor
  const handleInsertToManual = (numbers: string[]) => {
    setRawNumbers(numbers.join('\n'));
    setActiveMode('manual');
    setStatus({
      type: 'info',
      message: `Inserted ${numbers.length} numbers into manual list.`,
    });
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to fill
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (parsedNumbers.length > 0 && !isFilling) {
        handleFill(parsedNumbers);
      }
    }
  };

  return (
    <div className="popup-compact-container">
      {/* 1. Ultra-compact Header */}
      <Header
        currentHost={currentHost}
        detectedCount={detectedCount}
        isDetecting={isDetecting}
        onDetect={handleDetect}
      />

      {/* 2. Segmented Mode Switcher */}
      <div className="segmented-control">
        <button
          type="button"
          className={`segment-btn ${activeMode === 'random' ? 'active' : ''}`}
          onClick={() => setActiveMode('random')}
        >
          <span>🎲 Random Range</span>
        </button>
        <button
          type="button"
          className={`segment-btn ${activeMode === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveMode('manual')}
        >
          <span>✍ Manual List</span>
          {parsedNumbers.length > 0 && (
            <span className="segment-badge">{parsedNumbers.length}</span>
          )}
        </button>
      </div>

      {/* 3. Panel Content */}
      <main className="mode-content-area">
        {activeMode === 'random' ? (
          <RandomGenerator
            detectedCount={detectedCount}
            onFill={handleFill}
            onInsertToManual={handleInsertToManual}
            isFilling={isFilling}
          />
        ) : (
          <div className="manual-panel-compact">
            <div className="manual-header-row">
              <label htmlFor="manual-input" className="manual-label">
                Enter numbers (1 per line)
              </label>
              {rawNumbers.length > 0 && (
                <button
                  type="button"
                  className="btn-clear-text-link"
                  onClick={() => setRawNumbers('')}
                >
                  Clear text
                </button>
              )}
            </div>

            <textarea
              id="manual-input"
              className="textarea-compact"
              placeholder="123456&#10;789012&#10;345678"
              value={rawNumbers}
              onChange={(e) => setRawNumbers(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus
            />

            <div className="manual-footer-row">
              <span className="manual-counter">
                {parsedNumbers.length} number{parsedNumbers.length === 1 ? '' : 's'}
              </span>
              <span className="shortcut-hint">Ctrl + ↵</span>
            </div>

            <button
              type="button"
              className="btn-primary-action"
              onClick={() => handleFill(parsedNumbers)}
              disabled={isFilling || parsedNumbers.length === 0}
            >
              {isFilling ? (
                <>
                  <span className="spinner-micro spinner-white" />
                  <span>Filling...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>
                    Fill {parsedNumbers.length > 0 ? `${parsedNumbers.length} Numbers` : 'Fields'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* 4. Bottom Utility Strip */}
      <footer className="bottom-utility-strip">
        <button
          type="button"
          className="btn-utility"
          onClick={handleClear}
          disabled={isClearing || isFilling || (detectedCount === 0 && rawNumbers.length === 0)}
          title="Clear inputs on active webpage and reset"
        >
          {isClearing ? (
            <span className="spinner-micro" />
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          )}
          <span>Clear Page</span>
        </button>

        <button
          type="button"
          className="btn-utility"
          onClick={handleDetect}
          disabled={isDetecting}
          title="Highlight detected inputs on webpage"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Highlight</span>
        </button>
      </footer>

      {/* 5. Collapsible Field Inspector Drawer */}
      <FieldPreview
        fields={detectedFields}
        detectedCount={detectedCount}
      />

      {/* 6. Inline Status Notification */}
      <StatusBanner
        type={status.type}
        message={status.message}
        onDismiss={() => setStatus({ type: 'idle', message: '' })}
      />

      <div className="popup-footer-credit">
        NumFill • by mengleangyoeun
      </div>
    </div>
  );
};
