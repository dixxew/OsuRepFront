import React, { useState } from "react";
import { ChatUser } from "../types/ChatUser";
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
import {
  MailOutlined,
  StarOutlined,
  DownOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import "../styles/UserRow.css";

const { Text } = Typography;

interface UserRowProps {
  users: ChatUser[] | null;
  currentPage: number;
  pageSize: number;
  onSortChange: (sortField: string) => void;
  onRowClick: (record: ChatUser) => void;
  onSearchNickname: (term: string) => void; // добавь в пропсы
}

const formatDate = (iso: string | number | Date) => {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return String(iso ?? "");
  }
};

const renderAvatar = (
  url: string | null,
  index: number,
  currentPage: number,
  pageSize: number
) => {
  const globalIndex = (currentPage - 1) * pageSize + index;

  let size = 60;
  let borderColor: string | undefined;
  let boxShadow: string | undefined;

  if (currentPage === 1) {
    if (globalIndex === 0) {
      size = 80;
      borderColor = "gold";
      boxShadow = "0 0 0 3px rgba(255, 215, 0, 0.6)";
    } else if (globalIndex === 1) {
      size = 70;
      borderColor = "rebeccapurple";
      boxShadow = "0 0 0 3px rgba(102, 51, 153, 0.5)";
    } else if (globalIndex === 2) {
      size = 64;
      borderColor = "dodgerblue";
      boxShadow = "0 0 0 3px rgba(30, 144, 255, 0.5)";
    } else {
      size = 56;
    }
  }

  const src = url ?? "https://api.api-ninjas.com/v1/randomimage?category=cat"; // твой же fallback, оставил

  return (
    <Badge.Ribbon
      text={
        globalIndex < 3 && currentPage === 1 ? `#${globalIndex + 1}` : undefined
      }
      color={globalIndex === 0 ? "gold" : globalIndex === 1 ? "purple" : "blue"}
      style={{
        display: globalIndex < 3 && currentPage === 1 ? "block" : "none",
      }}
    >
      <Avatar
        size={size}
        src={src}
        alt="avatar"
        style={{
          border: borderColor ? `2px solid ${borderColor}` : undefined,
          boxShadow,
          backgroundColor: "#f5f5f5",
        }}
      />
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

  const columns = (
    currentPage: number,
    pageSize: number,
    onSortChange: (sortField: string) => void
  ) => [
    {
      title: "",
      dataIndex: "avatar",
      key: "avatar",
      width: 96,
      fixed: "left" as const,
      render: (url: string | null, _record: ChatUser, index: number) =>
        renderAvatar(url, index, currentPage, pageSize),
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
      render: (text: string) => (
        <Text
          strong
          ellipsis
          style={{ maxWidth: 200, display: "inline-block" }}
        >
          {text}
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
            Reputation &amp; Messages <DownOutlined />
          </Space>
        </Dropdown>
      ),
      dataIndex: "reputation",
      key: "reputationAndMessages",
      width: 260,
      render: (_: any, record: ChatUser) => (
        <Space size="middle" align="center">
          <Space>
            <StarOutlined style={{ color: "gold" }} />
            <Text>{record.reputation}</Text>
          </Space>
          <Space>
            <MailOutlined style={{ opacity: 0.7 }} />
            <Text type="secondary">{record.messagesCount}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Last Reputation",
      dataIndex: "lastRepNickname",
      key: "lastRep",
      ellipsis: true,
      render: (text: string, record: ChatUser) => {
        const nice = formatDate(record.lastRepTime!);
        return record.lastRepNickname ? (
          <Space direction="vertical" size={0}>
            <Text>
              from <Text strong>{record.lastRepNickname || text}</Text>
            </Text>
            <Tooltip title={"123"}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {nice}
              </Text>
            </Tooltip>
          </Space>
        ) : (
          <Text>Nobody 😢</Text>
        );
      },
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadiusLG: 14,
          controlHeight: 36,
        },
        components: {
          Table: {
            headerColor: "#333",
          },
        },
      }}
    >
      <Card
        bordered
        bodyStyle={{ padding: 0 }}
        style={{ overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}
      >
        <Table<ChatUser>
          columns={columns(currentPage, pageSize, onSortChange)}
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
