export interface ChatUser {
  id: string;
  osuId: number;
  avatar: string | null;
  nickname: string;
  reputation: number;
  lastRepTime: Date | null;
  lastRepNickname: string | null;
  messagesCount: number;

  // osu! данные
  level: number;
  pp: number;
  rank: number;
  playCount: number;
  accuracy: number;
  playTime: number;
  osuMode: string;
  countryCode: string;
  playstyle: string[];
  prevNicknames: string[];

  // дополнительная осу-инфа (можно потом подгружать из кэша)
  joinedAt?: string;
  location?: string;
  interests?: string;
  title?: string;
  twitter?: string;
  website?: string;
  discord?: string;
  globalRank?: number;
  countryRank?: number;
  isOnline?: boolean;
}