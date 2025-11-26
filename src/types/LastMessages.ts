import { Message } from "./Message";

export interface LastMessages {
  offset: number;
  limit: number;
  messages: Message[];
}


