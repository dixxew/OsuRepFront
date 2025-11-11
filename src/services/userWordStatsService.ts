import { TopWord } from "../types/WordStat";
import BaseService from "./baseService";

class UserWordStatsService extends BaseService {
  async getTopWords(nickname: string, limit = 20): Promise<TopWord[]> {
    const res = await this.client.get<TopWord[]>(
      `/UserWordStats/TopWords/${encodeURIComponent(nickname)}?limit=${limit}`
    );
    return res.data;
  }

  async getTopUsers(word: string, limit = 20): Promise<{ nickname: string; count: number }[]> {
    const res = await this.client.get<{ nickname: string; count: number }[]>(
      `/UserWordStats/TopUsers/${encodeURIComponent(word)}`,
      { params: { limit } }
    );
    return res.data;
  }
}

export const userWordStatsService = new UserWordStatsService();
