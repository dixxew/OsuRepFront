import BaseService from "./baseService";
import { TopWord } from "../types/WordStat";
import { WordSeriesPoint } from "../types/WordSeriesPoint";

class StatsService extends BaseService {
  async getTopWords(from?: string, to?: string, limit = 20) {
    const res = await this.client.get<TopWord[]>(
      `/Stats/GetTopWords`,
      {
        params: {
          from,
          to,
          limit
        }
      }
    );
    return res.data;
  }

  async getWordSeries(word: string, from?: string, to?: string) {
    const res = await this.client.get<WordSeriesPoint[]>(
      `/Stats/GetWordSeries`,
      {
        params: {
          word,
          from,
          to
        }
      }
    );
    return res.data;
  }

  async suggestWords(q: string, limit = 20) {
    const res = await this.client.get<string[]>(
      `/Stats/SuggestWords`,
      { params: { q, limit } }
    );
    return res.data;
  }
}

export const statsService = new StatsService();
