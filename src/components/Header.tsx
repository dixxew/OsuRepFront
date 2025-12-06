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
      </Flex>
    </AntHeader>
  );
};

export default Header;
