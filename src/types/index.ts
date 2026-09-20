/**
 * Field metadata extracted from the active webpage DOM
 */
export interface FieldInfo {
  index: number;
  tagName: 'input' | 'textarea';
  type: string;
  id: string;
  name: string;
  placeholder: string;
  ariaLabel: string;
  currentValue: string;
  isVisible: boolean;
  isEnabled: boolean;
}

/**
 * Site-specific configuration override
 */
export interface SiteRule {
  selector?: string;
  excludeSelector?: string;
  description?: string;
}

/**
 * Message types passed between Popup and Content Script
 */
export type MessageAction =
  | 'DETECT_FIELDS'
  | 'FILL_FIELDS'
  | 'CLEAR_FIELDS'
  | 'CLEAR_HIGHLIGHTS'
  | 'PING';

export interface DetectFieldsRequest {
  action: 'DETECT_FIELDS';
  highlight?: boolean;
}

export interface FillFieldsRequest {
  action: 'FILL_FIELDS';
  values: string[];
  highlight?: boolean;
}

export interface ClearFieldsRequest {
  action: 'CLEAR_FIELDS';
}

export interface ClearHighlightsRequest {
  action: 'CLEAR_HIGHLIGHTS';
}

export interface PingRequest {
  action: 'PING';
}

export type ExtensionRequest =
  | DetectFieldsRequest
  | FillFieldsRequest
  | ClearFieldsRequest
  | ClearHighlightsRequest
  | PingRequest;

/**
 * Response types
 */
export interface DetectFieldsResponse {
  success: boolean;
  count: number;
  fields: FieldInfo[];
  url: string;
  hostname: string;
  error?: string;
}

export interface FilledFieldDetail {
  index: number;
  nameOrId: string;
  value: string;
}

export interface FillFieldsResponse {
  success: boolean;
  totalInputsDetected: number;
  filledCount: number;
  unusedValuesCount: number;
  remainingInputsCount: number;
  filledFields: FilledFieldDetail[];
  error?: string;
}

export interface ClearFieldsResponse {
  success: boolean;
  clearedCount: number;
  error?: string;
}

export interface ClearHighlightsResponse {
  success: boolean;
}

export interface PingResponse {
  success: boolean;
  version: string;
}

/**
 * Storage schema for chrome.storage.local
 */
export interface ExtensionStorage {
  rawNumbers: string;
  lastUpdated?: number;
}
