export interface IntentResult {
  intent: string;
  confidence: number;
  entities?: Record<string, unknown>;
}

export interface IIntentParser {
  parse(text: string): Promise<IntentResult>;
}
