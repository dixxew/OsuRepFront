import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Flex,
  Typography,
  Skeleton,
  Empty,
  Button,
  Select,
  message,
  Divider,
} from "antd";
import { statsService } from "../services/wordStatsService";
import { rankStyles, getWordRank } from "../utils/wordRanks"; // вынеси как у UserModal
import { TopWord } from "../types/WordStat";

const { Title, Text } = Typography;

type FilterRange = "today" | "month" | "all";

const nf = new Intl.NumberFormat();

const StatsTopWords: React.FC = () => {
  const [range, setRange] = useState<FilterRange>("today");
  const [limit, setLimit] = useState(50);

  const [words, setWords] = useState<TopWord[] | null>(null);
  const [maxCount, setMaxCount] = useState(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { from, to } = useMemo(() => {
    const now = new Date();

    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000)
      .toISOString()
      .slice(0, 10);

    if (range === "today") return { from: today, to: tomorrow };
    if (range === "month") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      return { from: first, to: tomorrow };
    }
    return { from: undefined, to: undefined };
  }, [range]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = await statsService.getTopWords(from, to, limit);
        if (!mounted) return;

        setWords(data);
        const m = data.length > 0 ? Math.max(...data.map((x) => x.cnt)) : 1;
        setMaxCount(m);
      } catch (e: any) {
        if (mounted) {
          setErr(e?.message ?? "Failed to load");
          setWords([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [range, limit, from, to]);

  // стиль кнопок фильтра
  const filterBtn = (val: FilterRange, label: string) => {
    const active = range === val;

    return (
      <Button
        key={val}
        size="middle"
        onClick={() => setRange(val)}
        style={{
          minWidth: 110,
          height: 40,
          borderRadius: 8,
          fontWeight: 600,

          background: active ? "#1b1f29" : "#11141a",
          border: active
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid rgba(255,255,255,0.08)",
          color: active ? "#fff" : "#d5d6db",

          transition: "0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = active
            ? "#20242e"
            : "#161920";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = active
            ? "#1b1f29"
            : "#11141a";
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        borderRadius: 16,
        background: "#11141a",
        boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Flex vertical gap={16}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
          <Title level={4} style={{ margin: 0 }}>
            Word stats
          </Title>

          <Flex
            align="center"
            justify="center"
            gap={12}
            wrap="wrap"
          >
            {filterBtn("today", "Сегодня")}
            {filterBtn("month", "Месяц")}
            {filterBtn("all", "Всё время")}
          </Flex>

          <Select
            size="middle"
            value={limit}
            onChange={(v) => setLimit(v)}
            style={{
              width: 90,
              height: 40,
              borderRadius: 8,
              background: "#11141a",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#d5d6db",
            }}
            dropdownStyle={{
              background: "#11141a",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
            options={[
              { label: "20", value: 20 },
              { label: "50", value: 50 },
              { label: "100", value: 100 },
              { label: "200", value: 200 },
            ]}
            popupMatchSelectWidth={false}
          />
        </Flex>

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : err ? (
          <Empty description={<Text type="secondary">{err}</Text>} />
        ) : !words || words.length === 0 ? (
          <Empty description="Нет данных" />
        ) : (
          <>
            <Flex wrap="wrap" gap={12} style={{ width: "100%" }}>
              {words.map((w) => {
                const rank = getWordRank(w.rate);
                const st = rankStyles[rank];

                const copyText = `рейт ${w.word}`;
                const copy = async () => {
                  await navigator.clipboard.writeText(copyText);
                  message.success(
                    `Скопировано "${copyText}". Отправьте в чат.`
                  );
                };

                return (
                  <div
                    key={w.word}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#12151c",
                      borderRadius: 12,
                      padding: "10px 12px",
                      border: "1px solid #2a2f3a", // тонкий, не броский
                      minWidth: 240,
                      flexGrow: 1,
                      maxWidth: "calc(33% - 12px)",
                    }}
                  >
                    {/* rank mini badge */}
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 6,
                        color: st.borderColor,
                        border: `1px solid ${st.borderColor}`,
                        background: "#0b0d12",
                        opacity: 0.85,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rank}
                    </div>

                    {/* word strong and clear */}
                    <div
                      style={{
                        flex: 1,
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#f1f5f9",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {w.word}
                    </div>

                    {/* count small */}
                    <Text
                      style={{
                        minWidth: 48,
                        textAlign: "right",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      {nf.format(w.cnt)}
                    </Text>

                    {/* + button micro */}
                    <Button
                      size="small"
                      onClick={copy}
                      style={{
                        width: 26,
                        height: 26,
                        padding: 0,
                        borderRadius: 6,
                        background: "#1e2530",
                        border: "1px solid #2f3540",
                        color: "#cbd5e1",
                        fontWeight: 600,
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#2a313e";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#1e2530";
                      }}
                    >
                      +
                    </Button>
                  </div>
                );
              })}
            </Flex>
            <Divider
              style={{
                borderColor: "#2a2f3a",
                marginTop: 8,
                marginBottom: 4,
              }}
            />

            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 12,
                opacity: 0.85,
              }}
            >
              <div>
                Рейт можно отправить лишь раз в сутки на один аккаунт. Повторные
                рейты игнорируются.
              </div>
            </div>
          </>
        )}
      </Flex>
    </Card>
  );
};

export default StatsTopWords;
