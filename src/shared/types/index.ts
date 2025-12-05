export type Message = {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
};
