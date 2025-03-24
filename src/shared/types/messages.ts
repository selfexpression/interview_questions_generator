export enum MessageType {
  GENERATE_ANSWER = 'GENERATE_ANSWER',
  GENERATE_JSON_CONTENT = 'GENERATE_JSON_CONTENT',
  EXTRACT_TEXT = 'EXTRACT_TEXT',
  EXTRACT_LANGUAGE = 'EXTRACT_LANGUAGE',
}

export type MessageHandler = (
  message: MessageRequest,
  sendResponse: (response: MessageResponse) => void
) => void;

export interface MessageRequest {
  type: MessageType;
  prompt?: string;
  structure?: Record<string, string[]>;
  language?: string;
}

export interface MessageResponse {
  result?: string | Record<string, any>;
  error?: string;
}
