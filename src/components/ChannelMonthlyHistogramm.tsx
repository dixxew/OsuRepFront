import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import type { Plugin } from "chart.js";
import { Card, Skeleton, Empty, Flex, Typography, theme } from "antd";

const { Text, Title } = Typography;

interface DailyMessageCount {
  date: string; // ISO или совместимое
  messageCount: number;
}

const fmtLabel = (d: Date, withYear = false) =>
  new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "2-digit" } : {}),
  }).format(d);

const ChannelMonthlyHistogramm: React.FC = () => {
  const [data, setData] = useState<number[] | null>(null);
  const [dates, setDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const chartRef = useRef<any>(null);
  const { token } = theme.useToken();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await axios.get<DailyMessageCount[]>(
          `https://osu.dixxew.ru/api/Message/GetMonthlyMessageCounts`
        );

        const raw = (resp.data ?? []).slice().sort((a, b) => {
          // На всякий — гарантируем возрастание по дате
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        const vals = raw.map((x) => x.messageCount);
        const ds = raw.map((x) => new Date(x.date));

        if (!mounted) return;
        setData(vals);
        setDates(ds);
      } catch (e: any) {
        setErr(e?.message || "Failed to load monthly histogram data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const todayKey = useMemo(() => {
    const t = new Date();
    // нормализуем к дате без времени
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  }, []);

  const labels = useMemo(() => {
    if (!dates.length) return [];
    const yearSet = new Set(dates.map((d) => d.getFullYear()));
    const singleYear = yearSet.size === 1;
    return dates.map((d) => fmtLabel(d, !singleYear));
  }, [dates]);

  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] as any[] };
    const base = token.colorPrimaryBgHover;
    const highlight = token.colorPrimary;

    const bg = dates.map((d) => {
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      return key === todayKey ? highlight : base;
    });

    return {
      labels,
      datasets: [
        {
          label: "Messages per Day",
          data,
          backgroundColor: bg,
          borderRadius: 6,
          borderSkipped: false as const,
          barThickness: "flex" as const,
          maxBarThickness: 24, // не ломаем узкие месяцы
        },
      ],
    };
  }, [data, dates, labels, todayKey, token.colorPrimary, token.colorPrimaryBgHover]);

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      animation: { duration: 300 },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
          ticks: { color: "#7f7f7f", precision: 0 as const },
        },
        x: {
          grid: { display: false },
          ticks: {
            color: "#7f7f7f",
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 8,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          displayColors: false,
          callbacks: {
            title: (items: any[]) => {
              const idx = items?.[0]?.dataIndex ?? 0;
              const full = dates[idx];
              return full
                ? new Intl.DateTimeFormat(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  }).format(full)
                : items?.[0]?.label ?? "";
            },
            label: (ctx: any) => `Messages: ${ctx.parsed.y}`,
          },
        },
      },
    }),
    [dates]
  );

  // Тонкая линия на сегодняшнем дне
  const todayLinePlugin = useMemo<Plugin<"bar">>(
    () => ({
      id: "todayLine",
      afterDatasetsDraw(chart) {
        if (!dates.length) return;
        const idx = dates.findIndex((d) => {
          const k = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          return k === todayKey;
        });
        if (idx < 0) return;

        const { ctx, scales } = chart as any;
        const x = scales.x.getPixelForValue(idx);
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x, scales.y.top);
        ctx.lineTo(x, scales.y.bottom);
        ctx.stroke();
        ctx.restore();
      },
    }),
    [dates, todayKey]
  );

  return (
    <Card
      bordered
      style={{
        width: "100%",
        margin: "0 auto",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Flex vertical gap={12} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between">
          <Title level={4} style={{ margin: 0 }}>
            Monthly messages
          </Title>
          {dates.length ? (
            <Text type="secondary">
              {new Intl.DateTimeFormat(undefined, {
                month: "long",
                year: "numeric",
              }).format(dates[0])}
              {" — "}
              {new Intl.DateTimeFormat(undefined, {
                month: "long",
                year: "numeric",
              }).format(dates[dates.length - 1])}
            </Text>
          ) : (
            <Text type="secondary">No data</Text>
          )}
        </Flex>

        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : err ? (
          <Empty
            description={<Text type="secondary">Не смог загрузить данные: {err}</Text>}
          />
        ) : (
          <div style={{ height: 200 }}>
            <Bar data={chartData} options={options as any} plugins={[todayLinePlugin]} />
          </div>
        )}
      </Flex>
    </Card>
  );
};

export default ChannelMonthlyHistogramm;
