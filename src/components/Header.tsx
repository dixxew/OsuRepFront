import React, { useEffect, useState } from "react";
import osuIcon from "../img/icon-osu.png";
import { Layout, Typography, Flex, Tag, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import "../styles/Header.css";
import axios from "axios";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  // было: boolean; делаем null для состояния загрузки
  const [ircStatus, setIrcStatus] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    const fetchStatus = async () => {
      try {
        setError(null);
        const resp = await axios.get<boolean>(
          "https://osu.dixxew.ru/api/Status/IrcStatus"
        );
        // ставим фактическое значение, даже если false
        setIrcStatus(resp.data);
      } catch (e: any) {
        setError("Не удалось получить статус IRC");
        setIrcStatus(null); // оставляем "loading/unknown"
      }
    };

    fetchStatus();
    // опционально: автообновление раз в 30 сек
    timer = window.setInterval(fetchStatus, 30_000);

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const isLoading = ircStatus === null && !error;

  const tagProps =
    isLoading
      ? { icon: <SyncOutlined spin />, text: "IRC" }
      : error
      ? { icon: <CloseCircleOutlined />, text: "IRC неизвестно" }
      : ircStatus
      ? { icon: <CheckCircleOutlined />, text: "IRC online" }
      : { icon: <CloseCircleOutlined />, text: "IRC offline" };

  const tooltip =
    isLoading ? "Проверяю статус…" : error ?? (ircStatus ? "IRC подключен" : "IRC не подключен");

  return (
    <AntHeader className="app-header align-items-center" role="banner">
      <Flex className="app-header-inner align-items-center" justify="space-between" style={{ width: "100%" }}>
        <Flex align="center" gap={8}>
          <img alt="osu!" src={osuIcon} className="osu-icon" />
          <Text className="brand" strong>#russian</Text>
        </Flex>

        <Tooltip title={tooltip}>
          <Tag
            icon={tagProps.icon}
            style={{ margin: 0, borderRadius: 999 }}
          >
            {tagProps.text}
          </Tag>
        </Tooltip>
      </Flex>
    </AntHeader>
  );
};

export default Header;
