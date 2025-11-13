import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  ConfigProvider,
  Dropdown,
  Space,
  Table,
  Tag,
  Input,
  Tooltip,
  Typography,
} from "antd";
import { MailOutlined, StarOutlined, DownOutlined } from "@ant-design/icons";
import { ChatUser } from "../types/ChatUser";
import "../styles/UserRow.css";

const { Text } = Typography;

interface UserRowProps {
  users: ChatUser[] | null;
  currentPage: number;
  pageSize: number;
  onSortChange: (f: string) => void;
  onRowClick: (user: ChatUser) => void;
  onSearchNickname: (term: string) => void;
}

const TOP_STYLES = [
  { size: 80, color: "gold", shadow: "rgba(255,215,0,0.6)" },
  { size: 70, color: "rebeccapurple", shadow: "rgba(102,51,153,0.5)" },
  { size: 64, color: "dodgerblue", shadow: "rgba(30,144,255,0.5)" },
];

const formatDate = (v: any) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(v));
  } catch {
    return `${v || ""}`;
  }
};

const renderAvatar = (
  url: string | null,
  index: number,
  page: number,
  sizePage: number
) => {
  const global = (page - 1) * sizePage + index;
  const top = page === 1 ? TOP_STYLES[global] : undefined;

  const avatar = (
    <Avatar
      size={top?.size || 56}
      src={url ?? "https://api.api-ninjas.com/v1/randomimage?category=cat"}
      style={{
        border: top ? `2px solid ${top.color}` : undefined,
        boxShadow: top ? `0 0 0 3px ${top.shadow}` : undefined,
        background: "#f5f5f5",
      }}
    />
  );

  if (!top) return avatar;

  return (
    <Badge.Ribbon text={`#${global + 1}`} color={top.color}>
      {avatar}
    </Badge.Ribbon>
  );
};

const sortMenuItems = [
  { key: "reputation", label: "Reputation" },
  { key: "messages", label: "Messages" },
];

const UserTable: React.FC<UserRowProps> = ({
  users,
  currentPage,
  pageSize,
  onSortChange,
  onRowClick,
  onSearchNickname,
}) => {
  const [nicknameSearch, setNicknameSearch] = useState("");
  if (!users) return null;

  const columns = [
    {
      title: "",
      key: "avatar",
      width: 96,
      fixed: "left" as const,
      render: (_: any, record: ChatUser, idx: number) =>
        renderAvatar(record.avatar, idx, currentPage, pageSize),
    },
    {
      title: (
        <Input
          value={nicknameSearch}
          onChange={(e) => setNicknameSearch(e.target.value)}
          onPressEnter={() => onSearchNickname(nicknameSearch.trim())}
          placeholder="Search nickname..."
          allowClear
          style={{ width: 200 }}
        />
      ),
      dataIndex: "nickname",
      key: "nickname",
      width: 220,
      render: (t: string) => (
        <Text
          strong
          ellipsis
          style={{ maxWidth: 200, display: "inline-block" }}
        >
          {t}
        </Text>
      ),
    },
    {
      title: (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: sortMenuItems,
            onClick: ({ key }) => onSortChange(String(key)),
          }}
        >
          <Space style={{ cursor: "pointer" }}>
            Reputation & Messages <DownOutlined />
          </Space>
        </Dropdown>
      ),
      key: "stats",
      width: 260,
      render: (_: any, r: ChatUser) => (
        <Space size="middle">
          <Space>
            <StarOutlined style={{ color: "gold" }} />
            <Text>{r.reputation}</Text>
          </Space>
          <Space>
            <MailOutlined style={{ opacity: 0.7 }} />
            <Text type="secondary">{r.messagesCount}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Last Reputation",
      key: "lastRep",
      ellipsis: true,
      render: (_: any, r: ChatUser) =>
        r.lastRepNickname ? (
          <Space direction="vertical" size={0}>
            <Text>
              from <Text strong>{r.lastRepNickname}</Text>
            </Text>
            <Tooltip title="123">
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatDate(r.lastRepTime)}
              </Text>
            </Tooltip>
          </Space>
        ) : (
          <Text>Nobody 😢</Text>
        ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: { borderRadiusLG: 14, controlHeight: 36 },
        components: { Table: { headerColor: "#333" } },
      }}
    >
      <Card
        bordered
        bodyStyle={{ padding: 0 }}
        style={{
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
      >
        <Table<ChatUser>
          columns={columns}
          dataSource={users}
          rowKey="id"
          size="middle"
          pagination={false}
          sticky
          onRow={(record) => ({
            onClick: () => onRowClick(record),
            style: { cursor: "pointer" },
          })}
          scroll={{ y: "50vh", x: 800 }}
        />
      </Card>
    </ConfigProvider>
  );
};

export default UserTable;
