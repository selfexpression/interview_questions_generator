export enum MessageType {
  GENERATE_ANSWER = 'GENERATE_ANSWER',
  GENERATE_JSON_CONTENT = 'GENERATE_JSON_CONTENT',
  GET_JOB_TEXT = 'GET_JOB_TEXT',
  EXTRACT_TEXT = 'EXTRACT_TEXT',
}

export interface MessageRequest {
  type: MessageType;
  prompt?: string;
  structure?: Record<string, string[]>;
}

export interface MessageResponse {
  result?: string | Record<string, any>;
  error?: string;
  text?: string;
}
