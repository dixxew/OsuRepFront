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
  const [ircStatus, setIrcStatus] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;

    const fetchStatus = async () => {
      try {
        setError(null);
        const resp = await axios.get<boolean>(
          "https://osu.dixxew.ru/api/Status/IrcStatus"
        );
        setIrcStatus(resp.data);
      } catch {
        setIrcStatus(null);
        setError("Не удалось получить статус IRC");
      }
    };

    fetchStatus();
    timer = window.setInterval(fetchStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  const isLoading = ircStatus === null && !error;

  const tagProps =
    isLoading
      ? { icon: <SyncOutlined spin />, text: "Checking…" }
      : error
      ? { icon: <CloseCircleOutlined />, text: "Unknown" }
      : ircStatus
      ? { icon: <CheckCircleOutlined />, text: "Online" }
      : { icon: <CloseCircleOutlined />, text: "Offline" };

  const tooltip =
    isLoading
      ? "Проверяю статус…"
      : error ?? (ircStatus ? "IRC подключен" : "IRC не подключен");

  return (
    <AntHeader className="app-header glossy-header" role="banner">
      <Flex
        className="app-header-inner"
        justify="space-between"
        align="center"
      >
        <Flex align="center" gap={10}>
          <img alt="osu!" src={osuIcon} className="osu-icon neon-pulse" />
          <Text className="brand brand-neon" strong>
            #russian
          </Text>
        </Flex>

        <Tooltip title={tooltip}>
          <Tag icon={tagProps.icon} className="status-tag status-glow">
            {tagProps.text}
          </Tag>
        </Tooltip>
      </Flex>
    </AntHeader>
  );
};

export default Header;
