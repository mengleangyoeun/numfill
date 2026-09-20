import React from 'react';

interface HeaderProps {
  currentHost?: string;
  detectedCount: number;
  isDetecting: boolean;
  onDetect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentHost,
  detectedCount,
  isDetecting,
  onDetect,
}) => {
  return (
    <header className="header-compact">
      <div className="brand-compact">
        <span className="brand-badge">⚡ NumFill</span>
        <span className="brand-author">by mengleangyoeun</span>
      </div>

      <div className="header-right">
        {currentHost && (
          <span className="host-pill-compact" title={`Active tab: ${currentHost}`}>
            {currentHost}
          </span>
        )}

        <button
          type="button"
          className={`count-badge-btn ${detectedCount > 0 ? 'count-badge-active' : 'count-badge-empty'}`}
          onClick={onDetect}
          disabled={isDetecting}
          title="Click to re-scan and highlight inputs on webpage"
        >
          {isDetecting ? (
            <>
              <span className="spinner-micro" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span className="dot-indicator" />
              <span>{detectedCount} {detectedCount === 1 ? 'input' : 'inputs'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
