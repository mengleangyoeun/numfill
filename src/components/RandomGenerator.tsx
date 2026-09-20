import React, { useState } from 'react';
import { generateRandomNumbers } from '../utils/random';

interface RandomGeneratorProps {
  detectedCount: number;
  onFill: (numbers: string[]) => void;
  onInsertToManual: (numbers: string[]) => void;
  isFilling: boolean;
}

export const RandomGenerator: React.FC<RandomGeneratorProps> = ({
  detectedCount,
  onFill,
  onInsertToManual,
  isFilling,
}) => {
  const [min, setMin] = useState<number>(10);
  const [max, setMax] = useState<number>(99);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  const [customCount, setCustomCount] = useState<number>(5);
  const [unique, setUnique] = useState<boolean>(true);

  // Auto mode syncs with detectedCount, custom mode uses user input
  const count = isAutoMode
    ? detectedCount > 0
      ? detectedCount
      : 5
    : customCount;

  const handleApplyPreset = (presetMin: number, presetMax: number) => {
    setMin(presetMin);
    setMax(presetMax);
  };

  const getNumbers = (): string[] => {
    const res = generateRandomNumbers({
      min,
      max,
      count,
      unique,
    });
    return res.map(String);
  };

  const handleFillClick = () => {
    const list = getNumbers();
    onFill(list);
  };

  const handleInsertClick = () => {
    const list = getNumbers();
    onInsertToManual(list);
  };

  return (
    <div className="random-panel-compact">
      {/* Presets row */}
      <div className="presets-compact">
        <span className="presets-title">Presets:</span>
        <div className="preset-chips-scroll">
          <button
            type="button"
            className="chip-btn"
            onClick={() => handleApplyPreset(10, 99)}
          >
            2-digit
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() => handleApplyPreset(1000, 9999)}
          >
            4-digit
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() => handleApplyPreset(100000, 999999)}
          >
            6-digit
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() => handleApplyPreset(10000000, 99999999)}
          >
            8-digit
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() => handleApplyPreset(1, 100)}
          >
            1-100
          </button>
        </div>
      </div>

      {/* Min, Max, Count Grid */}
      <div className="range-grid-compact">
        <div className="range-field">
          <label htmlFor="rng-min">Min</label>
          <input
            type="number"
            id="rng-min"
            className="input-compact"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
          />
        </div>

        <div className="range-field">
          <label htmlFor="rng-max">Max</label>
          <input
            type="number"
            id="rng-max"
            className="input-compact"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </div>

        <div className="range-field">
          <div className="count-label-header">
            <label htmlFor="rng-count">Count</label>
            {isAutoMode ? (
              <span className="auto-tag">Auto</span>
            ) : (
              <button
                type="button"
                className="btn-sync-auto"
                onClick={() => setIsAutoMode(true)}
                title="Lock to detected inputs"
              >
                Auto ({detectedCount > 0 ? detectedCount : 'scan'})
              </button>
            )}
          </div>
          <input
            type="number"
            id="rng-count"
            min="1"
            max="500"
            className={`input-compact ${isAutoMode ? 'input-auto' : ''}`}
            value={count}
            onChange={(e) => {
              setIsAutoMode(false);
              setCustomCount(Math.max(1, Number(e.target.value)));
            }}
          />
        </div>
      </div>

      {/* Unique Option & Secondary action */}
      <div className="range-sub-row">
        <label className="checkbox-compact">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
          />
          <span>Unique numbers</span>
        </label>

        <button
          type="button"
          className="btn-link-action"
          onClick={handleInsertClick}
          title="Send generated numbers to manual textarea editor"
        >
          Insert to Manual →
        </button>
      </div>

      {/* Primary Fill Button */}
      <button
        type="button"
        className="btn-primary-action"
        onClick={handleFillClick}
        disabled={isFilling}
      >
        {isFilling ? (
          <>
            <span className="spinner-micro spinner-white" />
            <span>Filling {count} inputs...</span>
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Fill {count} Fields Now</span>
          </>
        )}
      </button>
    </div>
  );
};
