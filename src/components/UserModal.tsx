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
const num = (v?: number) => (typeof v === "number" ? nf.format(v) : "—");

const styleIcons: Record<string, React.ReactNode> = {
  mouse: <AimOutlined />,
  keyboard: <LaptopOutlined />,
  touch: <MobileOutlined />,
  tablet: <TabletOutlined />,
};

const UserModal: React.FC<UserModalProps> = ({ visible, user, onClose }) => {
  const [words, setWords] = useState<TopWord[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [maxCount, setMaxCount] = useState(1);

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
      width={860}
      centered
      destroyOnClose
      className="user-modal"
    >
      <div className="user-modal__content">
        <Flex gap={20} align="flex-start" wrap="wrap">
          {/* AVATAR BLOCK */}
          <div className="user-modal__avatar-wrap">
            <div className="user-modal__avatar-border">
              <Avatar
                size={220}
                src={user.avatar || undefined}
                icon={!user.avatar ? <UserOutlined /> : undefined}
                style={{
                  background: "#020617",
                }}
              />
            </div>

            {flagUrl && (
              <div className="user-modal__flag">
                <img src={flagUrl} alt={user.countryCode ?? ""} />
              </div>
            )}
          </div>

          {/* MAIN INFO */}
          <Flex vertical style={{ flex: 1, minWidth: 320 }} gap={8}>
            {/* Header: nickname + rep */}
            <Flex align="center" justify="space-between" wrap="wrap">
              <Flex align="center" gap={8} wrap="wrap">
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: "#f9fafb",
                    lineHeight: 1.1,
                    letterSpacing: 0.3,
                  }}
                >
                  {user.nickname}
                </Title>

                <Tooltip title="Open osu! profile">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="user-modal__profile-link"
                  >
                    <UserOutlined />
                  </a>
                </Tooltip>
              </Flex>

              <Tag className="user-modal__rep-tag">
                <StarFilled style={{ marginRight: 6 }} />
                {num(user.reputation)}
              </Tag>
            </Flex>

            {/* Level bar */}
            <div className="user-modal__level-block">
              <div className="user-modal__level-bar-bg">
                <div
                  className="user-modal__level-bar-fill"
                  style={{
                    width: `${levelProgress}%`,
                    background: levelColor,
                  }}
                />
              </div>
              <div className="user-modal__level-text">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Lv. {Math.floor(user.level)}
                </Text>
              </div>
            </div>

            {/* Rank / PP / Accuracy */}
            <Flex justify="space-between" wrap="wrap" gap={16}>
              <div className="user-modal__stat-block">
                <Text type="secondary" className="user-modal__label">
                  Global Rank
                </Text>
                <Title level={4} className="user-modal__stat-title blue">
                  #{num(user.rank)}
                </Title>
              </div>

              <div className="user-modal__stat-block">
                <Text type="secondary" className="user-modal__label">
                  Performance (PP)
                </Text>
                <Title level={4} className="user-modal__stat-title yellow">
                  {num(user.pp)}
                </Title>
              </div>

              <div className="user-modal__stat-block">
                <Progress
                  type="circle"
                  percent={Math.min(user.accuracy ?? 0, 100)}
                  width={80}
                  strokeColor={{
                    "0%": "#38bdf8",
                    "100%": "#0ea5e9",
                  }}
                  trailColor="#020617"
                  format={(p) => `${(p ?? 0).toFixed(1)}%`}
                />
              </div>
            </Flex>

            <Divider className="user-modal__divider" />

            {/* Play info */}
            <Flex justify="space-between" wrap="wrap" gap={16}>
              <Flex vertical align="flex-start" gap={2}>
                <Text type="secondary" className="user-modal__label">
                  Play Count
                </Text>
                <Text strong className="user-modal__stat-plain">
                  {num(user.playCount)}
                </Text>
              </Flex>
              <Flex vertical align="flex-start" gap={2}>
                <Text type="secondary" className="user-modal__label">
                  Play Time
                </Text>
                <Text strong className="user-modal__stat-plain">
                  {Math.round(user.playTime ?? 0)}h
                </Text>
              </Flex>
              {/* Playstyle */}
              {user.playstyle?.length > 0 && (
                <>
                  <Flex align="center" gap={8} wrap="wrap">
                    <Text type="secondary" style={{ minWidth: 80 }}>
                      Playstyle:
                    </Text>
                    <Space wrap>
                      {user.playstyle.map((p) => {
                        const key = p.toLowerCase();
                        return (
                          <Tooltip key={p} title={p}>
                            <Tag className="user-modal__playstyle-tag">
                              {styleIcons[key] ?? "?"}
                            </Tag>
                          </Tooltip>
                        );
                      })}
                    </Space>
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        </Flex>

        {/* WORDS */}
        <Divider className="user-modal__divider" />

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
                const alpha = 0.25 + intensity * 0.4;
                const bg = `linear-gradient(145deg, rgba(56,189,248,${alpha}), rgba(14,165,233,${alpha}))`;

                return (
                  <div
                    key={w.word}
                    className="user-modal__word-chip"
                    style={{ background: bg }}
                  >
                    <span className="user-modal__word-text">{w.word}</span>
                    <span className="user-modal__word-count">{w.count}</span>
                  </div>
                );
              })}
            </Flex>
          )}
        </Flex>
      </div>
    </Modal>
  );
};

export default UserModal;
