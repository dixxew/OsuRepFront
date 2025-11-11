import React, { useEffect, useState } from "react";
import {
  Modal,
  Avatar,
  Flex,
  Typography,
  Divider,
  Space,
  Tag,
  Tooltip,
  Progress,
} from "antd";
import {
  StarFilled,
  UserOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  AimOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ChatUser } from "../types/ChatUser";
import "../styles/UserModal.css";
import { TopWord } from "../types/WordStat";
import { userWordStatsService } from "../services/userWordStatsService";

const { Title, Text } = Typography;

interface UserModalProps {
  visible: boolean;
  user: ChatUser | null;
  onClose: () => void;
}

const nf = new Intl.NumberFormat();
const pct = (v?: number) => (typeof v === "number" ? `${v.toFixed(2)}%` : "—");
const num = (v?: number) => (typeof v === "number" ? nf.format(v) : "—");

const styleIcons: Record<string, JSX.Element> = {
  mouse: <AimOutlined />,
  tablet: <TabletOutlined />,
  keyboard: <LaptopOutlined />,
  touch: <MobileOutlined />,
};

const UserModal: React.FC<UserModalProps> = ({ visible, user, onClose }) => {
  const [words, setWords] = useState<TopWord[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    if (!user || !visible) return;
    setLoadingWords(true);
    userWordStatsService
      .getTopWords(user.nickname, 50)
      .then((res) => {
        setWords(res);
        setMaxCount(Math.max(...res.map((x) => x.count), 1));
      })
      .catch((e) => console.error("Failed to load user words:", e))
      .finally(() => setLoadingWords(false));
  }, [user, visible]);

  if (!user) return null;

  const flagUrl = user.countryCode
    ? `https://osu.ppy.sh/images/flags/${user.countryCode}.png`
    : "";

  const profileUrl = `https://osu.ppy.sh/users/${user.osuId}`;

  const levelColor =
    user.level >= 100
      ? "linear-gradient(90deg, #a855f7, #8b5cf6)"
      : "linear-gradient(90deg, #38bdf8, #0ea5e9)";
  const levelProgress = Math.min((user.level % 100) / 100, 1) * 100;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
      className="user-modal"
    >
      <Flex gap={16} align="center" wrap="wrap" style={{ padding: "12px 8px" }}>
        {/* AVATAR */}
        <div style={{ position: "relative" }}>
          <Avatar
            size={220}
            src={user.avatar || undefined}
            icon={!user.avatar ? <UserOutlined /> : undefined}
            style={{
              border: "3px solid #1f2937",
              background: "#0f172a",
              boxShadow: "0 0 20px rgba(0,0,0,0.4)",
            }}
          />
          {flagUrl && (
            <img
              src={flagUrl}
              alt={user.countryCode}
              style={{
                width: 36,
                height: 24,
                borderRadius: 3,
                position: "absolute",
                bottom: 8,
                right: 8,
                border: "1px solid #1e293b",
                boxShadow: "0 0 6px rgba(0,0,0,0.4)",
              }}
            />
          )}
        </div>

        {/* MAIN INFO */}
        <Flex vertical style={{ flex: 1, minWidth: 300 }} gap={4}>
          <Flex align="center" justify="space-between" wrap="wrap">
            <Flex align="center" gap={8}>
              <Title
                level={3}
                style={{ margin: 0, color: "#f1f5f9", lineHeight: 1.1 }}
              >
                {user.nickname}
              </Title>

              {/* 🔗 osu! profile link */}
              <Tooltip title="Open osu! profile">
                <a
                  href={`https://osu.ppy.sh/users/${user.osuId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#38bdf8",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    transition: "0.2s",
                  }}
                >
                  <UserOutlined style={{ marginRight: 4 }} />
                </a>
              </Tooltip>
            </Flex>

            <Tag
              color="#111"
              style={{
                background: "linear-gradient(90deg, #f59e0b, #facc15)",
                color: "#111",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              <StarFilled /> {num(user.reputation)}
            </Tag>
          </Flex>

          {/* Level */}
          <div style={{ width: "100%", marginTop: 4 }}>
            <div
              style={{
                height: 10,
                borderRadius: 6,
                background: "#1e293b",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${levelProgress}%`,
                  height: "100%",
                  background: levelColor,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                marginTop: 2,
                display: "block",
                textAlign: "right",
              }}
            >
              Lv. {Math.floor(user.level)}
            </Text>
          </div>

          {/* Rank / PP / Acc */}
          <Flex justify="space-between" wrap="wrap" style={{ marginTop: 8 }}>
            <div>
              <Text type="secondary">Rank</Text>
              <Title level={4} style={{ margin: 0, color: "#60a5fa" }}>
                #{num(user.rank)}
              </Title>
            </div>

            <div>
              <Text type="secondary">PP</Text>
              <Title level={4} style={{ margin: 0, color: "#fbbf24" }}>
                {num(user.pp)}
              </Title>
            </div>

            <Flex vertical align="center">
              <Text type="secondary">Accuracy</Text>
              <Progress
                type="circle"
                percent={Math.min(user.accuracy ?? 0, 100)}
                width={80}
                strokeColor={{
                  "0%": "#38bdf8",
                  "100%": "#0ea5e9",
                }}
                trailColor="#1e293b"
                format={(p) => `${p?.toFixed(1)}%`}
              />
            </Flex>
          </Flex>

          <Divider style={{ margin: "10px 0" }} />

          {/* Play info */}
          <Flex justify="space-around" wrap="wrap" gap={16}>
            <Flex vertical align="center">
              <Text type="secondary">Play Count</Text>
              <Text strong>{num(user.playCount)}</Text>
            </Flex>
            <Flex vertical align="center">
              <Text type="secondary">Play Time</Text>
              <Text strong>{Math.round(user.playTime ?? 0)}h</Text>
            </Flex>
          </Flex>

          {/* Playstyle */}
          {user.playstyle?.length > 0 && (
            <>
              <Divider style={{ margin: "10px 0" }} />
              <Flex align="center" gap={8} wrap="wrap">
                <Text type="secondary" style={{ width: 70 }}>
                  Playstyle:
                </Text>
                <Space>
                  {user.playstyle.map((p) => (
                    <Tooltip key={p} title={p}>
                      <Tag
                        color="blue"
                        style={{
                          fontSize: 18,
                          borderRadius: "50%",
                          padding: 10,
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(145deg, #1e293b, #0f172a)",
                        }}
                      >
                        {styleIcons[p.toLowerCase()] ?? "?"}
                      </Tag>
                    </Tooltip>
                  ))}
                </Space>
              </Flex>
            </>
          )}
        </Flex>
        {/* --- USER WORD STATS --- */}
        <Divider style={{ margin: "10px 0" }} />
        <Flex vertical gap={8}>
          <Text strong style={{ fontSize: 16 }}>
            💬 Любимые слова
          </Text>

          {loadingWords ? (
            <Flex justify="center" style={{ padding: "12px 0" }}>
              <LoadingOutlined
                style={{ fontSize: 24, color: "#38bdf8" }}
                spin
              />
            </Flex>
          ) : words.length === 0 ? (
            <Text type="secondary" style={{ fontStyle: "italic" }}>
              ничего не найдено
            </Text>
          ) : (
            <Flex
              wrap="wrap"
              gap={10}
              style={{
                marginTop: 4,
                alignItems: "center",
              }}
            >
              {words.map((w) => {
                const intensity = w.count / maxCount;
                const bg = `linear-gradient(145deg, rgba(56,189,248,${
                  0.25 + intensity * 0.4
                }), rgba(14,165,233,${0.25 + intensity * 0.4}))`;

                return (
                  <div
                    key={w.word}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: bg,
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 12,
                      padding: "6px 10px 6px 12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      backdropFilter: "blur(6px)",
                      color: "#e2e8f0",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      cursor: "default",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (
                      (e.currentTarget.style.transform = "translateY(-2px)"),
                      (e.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(0,0,0,0.35)")
                    )}
                    onMouseLeave={(e) => (
                      (e.currentTarget.style.transform = "translateY(0)"),
                      (e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(0,0,0,0.25)")
                    )}
                  >
                    <span style={{ marginRight: 6 }}>{w.word}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#cbd5e1",
                        fontWeight: 400,
                      }}
                    >
                      {w.count}
                    </span>
                  </div>
                );
              })}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default UserModal;
