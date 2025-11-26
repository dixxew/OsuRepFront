import React, { useEffect, useRef, useState } from "react";
import { Avatar, Card, Flex, Skeleton } from "antd";
import { messageService } from "../services/messageService";
import { Message } from "../types/Message";
import { ClockCircleOutlined, GlobalOutlined } from "@ant-design/icons";
import { getUserColors } from "../utils/chatColors";

const PAGE_SIZE = 50;

const LinkTag: React.FC<{ href: string; title?: string }> = ({
  href,
  title,
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 6px",
        borderRadius: 8,
        border: "1px solid #2a2f3a",
        background: "#1a1d25",
        color: "#f7b5f7ff",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {title ?? href}

      <GlobalOutlined style={{ fontSize: 14 }} />
    </a>
  );
};

const ChatMessages: React.FC = () => {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [endReached, setEndReached] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  // ===== ЗАГРУЗКА СООБЩЕНИЙ (старых) =====
  const loadMore = async () => {
    if (loading || endReached) return;

    setLoading(true);

    const data = await messageService.getLastMessages(offset, PAGE_SIZE);

    if (!data.messages.length) {
      setEndReached(true);
      setLoading(false);
      return;
    }

    // сервер DESC → фронт ASC
    const asc = [...data.messages].reverse();

    setMsgs((prev) => [...asc, ...prev]);
    setOffset((x) => x + asc.length);

    setLoading(false);
  };

  function groupMessages(messages: Message[]) {
    const groups: { user: Message; items: Message[] }[] = [];

    for (const msg of messages) {
      const last = groups[groups.length - 1];

      if (last && last.user.userOsuId === msg.userOsuId) {
        last.items.push(msg);
      } else {
        groups.push({ user: msg, items: [msg] });
      }
    }

    return groups;
  }

  const grouped = groupMessages(msgs);

  // ===== первая загрузка =====
  useEffect(() => {
    (async () => {
      await loadMore();

      // автоскролл вниз на старте
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    })();
  }, []);

  // ===== скролл вверх → догрузка =====
  const handleScroll = async () => {
    const el = listRef.current;
    if (!el) return;

    if (el.scrollTop < 50 && !loading && !endReached) {
      const prevHeight = el.scrollHeight;

      await loadMore();

      // фиксируем позицию после prepend
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight + el.scrollTop;
      });
    }
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  function extractMaskedLinks(text: string) {
    const links: { url: string; title: string; start: number; end: number }[] =
      [];

    let pos = 0;

    while (pos < text.length) {
      const open = text.indexOf("[", pos);
      if (open === -1) break;

      // ищем пробел после URL
      const space = text.indexOf(" ", open + 1);
      if (space === -1) break;

      const url = text.slice(open + 1, space);
      if (!/^https?:\/\//.test(url)) {
        pos = open + 1;
        continue;
      }

      // Теперь ищем ЗАКРЫВАЮЩУЮ ] — последнюю перед следующим [
      let close = -1;
      for (let i = space + 1; i < text.length; i++) {
        if (text[i] === "]") close = i;
        if (text[i] === "[" && i !== open) break;
      }

      if (close === -1) {
        pos = open + 1;
        continue;
      }

      const title = text.slice(space + 1, close);
      links.push({ url, title, start: open, end: close + 1 });

      pos = close + 1;
    }

    return links;
  }

  function parseRawLinks(text: string): React.ReactNode[] {
    const regex = /https?:\/\/[^\s]+/g;
    const out: React.ReactNode[] = [];

    let last = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const url = match[0];

      if (match.index > last) {
        out.push(text.slice(last, match.index));
      }

      out.push(<LinkTag key={match.index} href={url} />);
      last = match.index + url.length;
    }

    if (last < text.length) {
      out.push(text.slice(last));
    }

    return out;
  }

  function parseMessageText(text: string): React.ReactNode[] {
    const masked = extractMaskedLinks(text);

    if (masked.length === 0) {
      return parseRawLinks(text);
    }

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    for (const m of masked) {
      if (cursor < m.start) {
        nodes.push(...parseRawLinks(text.slice(cursor, m.start)));
      }

      nodes.push(<LinkTag key={m.start} href={m.url} title={m.title} />);
      cursor = m.end;
    }

    if (cursor < text.length) {
      nodes.push(...parseRawLinks(text.slice(cursor)));
    }

    return nodes;
  }

  const copyGroupText = (group: { user: Message; items: Message[] }) => {
    const fullText = group.items.map((m) => m.text).join("\n");
    navigator.clipboard.writeText(fullText).catch(() => {});
  };

  return (
    <Card
      bordered={false}
      title="Chat history"
      style={{
        width: "100%",
        height: 800,
        borderRadius: 16,
        background: "#11141a",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        padding: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        ref={listRef}
        className="chat-scroll gradient-bg"
        onScroll={handleScroll}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 16,
          gap: 12,
          boxSizing: "border-box",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: 13, padding: "4px 0" }}>
          Loading...
        </div>

        {grouped.map((group, i) => (
          <Flex
            key={group.user.date + group.user.text}
            gap={12}
            align="flex-start"
            style={{ maxWidth: 700, width: "100%" }}
          >
            {/* Аватар + ник под ним */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 70,
              }}
            >
              <Avatar
                size={54}
                src={`https://a.ppy.sh/${group.user.userOsuId}`}
                style={{ borderRadius: 99, flexShrink: 0 }}
              />
              <div
                style={{
                  marginTop: 4,
                  fontWeight: 700,
                  color: getUserColors(group.user.userOsuId).nameColor,
                  fontSize: 12,
                  textAlign: "center",
                  maxWidth: 120,
                }}
              >
                {group.user.nickname ?? "user"}
              </div>
            </div>

            <div
              className="message-block"
              onClick={() => copyGroupText(group)}
              style={{
                flex: 1,
                background: "#12151c",
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid #2a2f3a",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {group.items.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    color: "#e2e8f0",
                    fontSize: 17,
                    whiteSpace: "pre-wrap",
                    fontFamily: "Consolas, monospace",
                    wordBreak: "break-word",
                  }}
                >
                  {parseMessageText(m.text)}
                </div>
              ))}

              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: "right",
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {new Date(
                  group.items[group.items.length - 1].date
                ).toLocaleTimeString()}
              </div>
            </div>
          </Flex>
        ))}
      </div>
    </Card>
  );
};

export default ChatMessages;
