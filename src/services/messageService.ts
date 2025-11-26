import { LastMessages } from "../types/LastMessages";
import BaseService from "./baseService";

class MessageService extends BaseService {
  async getLastMessages(offset: number, limit = 20): Promise<LastMessages> {
    const res = await this.client.get<LastMessages>(
      `/Message/GetLastMessages`,
      { params: { offset, limit } }
    );
    return res.data;
  }
}

export const messageService = new MessageService();
