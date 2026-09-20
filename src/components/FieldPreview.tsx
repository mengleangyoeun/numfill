import React, { useState } from 'react';
import type { FieldInfo } from '../types';

interface FieldPreviewProps {
  fields: FieldInfo[];
  detectedCount: number;
}

export const FieldPreview: React.FC<FieldPreviewProps> = ({
  fields,
  detectedCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (detectedCount === 0) {
    return null;
  }

  return (
    <div className="inspector-drawer">
      <button
        type="button"
        className="inspector-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="inspector-trigger-label">
          <span>{isOpen ? '▴ Hide Field Details' : '▾ Inspect Fields'}</span>
          <span className="count-pill-micro">{detectedCount}</span>
        </span>
        <span className="inspector-arrow">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="inspector-chip-grid">
          {fields.map((field) => {
            const label =
              field.id
                ? `#${field.id}`
                : field.name
                  ? `[${field.name}]`
                  : field.placeholder
                    ? `"${field.placeholder}"`
                    : `Field #${field.index + 1}`;

            return (
              <div key={field.index} className="field-chip" title={`${field.tagName} (${field.type})`}>
                <span className="chip-index">#{field.index + 1}</span>
                <span className="chip-name">{label}</span>
                {field.currentValue && <span className="chip-filled-dot" title="Has existing value" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
