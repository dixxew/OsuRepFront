import axios, { AxiosInstance } from "axios";

class BaseService {
  protected client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: (baseURL ?? process.env.REACT_APP_API_BASE_URL) + "/api",
      timeout: 15000,
    });

    // запрос лог
    this.client.interceptors.request.use((config) => {
      console.debug("➡️", config.method?.toUpperCase(), config.url);
      return config;
    });

    // ответ лог
    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        console.error("❌ API error:", err.response?.status, err.message);
        throw err;
      }
    );
  }
}

export default BaseService;
