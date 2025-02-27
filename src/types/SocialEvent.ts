export enum SocialEventType {
  FLEX = 'flex',
  MEME = 'meme'
}

interface SocialEventMetadata {
  power?: number;
  reactionCount?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface SocialEvent {
  id: string;
  type: SocialEventType;
  sender: `0x${string}`;
  content: string;
  timestamp: number;
  metadata?: SocialEventMetadata;
} 