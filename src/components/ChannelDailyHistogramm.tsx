import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Card, Flex, Skeleton, Statistic, Typography, Empty, theme } from "antd";
import type { Plugin } from "chart.js";

const { Title, Text } = Typography;

interface HourlyAverageMessageCount {
  hour: number; // 0..23
  averageMessageCount: number;
}

const HOUR_COUNT = 24;

const pad2 = (n: number) => n.toString().padStart(2, "0");
const hourLabel = (h: number) => `${pad2(h)}:00`;
const wrap24 = (i: number) => ((i % HOUR_COUNT) + HOUR_COUNT) % HOUR_COUNT;

const ChannelDailyHistogramm: React.FC = () => {
  const [data, setData] = useState<number[] | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const chartRef = useRef<any>(null);
  const { token } = theme.useToken();

  const nowHour = new Date().getHours();
  const prevHour = wrap24(nowHour - 1);
  const nextHour = wrap24(nowHour + 1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await axios.get<HourlyAverageMessageCount[]>(
          `https://osu.dixxew.ru/api/Message/GetDailyMessageCounts`
        );

        // Нормализуем к 24 точкам (на всякий)
        const raw = resp.data ?? [];
        const byHour = Array.from({ length: HOUR_COUNT }, (_, h) => {
          const item = raw.find((x) => x.hour === h);
          return item ? item.averageMessageCount : 0;
        });

        if (!mounted) return;

        setData(byHour);
        setLabels(Array.from({ length: HOUR_COUNT }, (_, h) => hourLabel(h)));
      } catch (e: any) {
        setErr(e?.message || "Failed to load histogram data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const currentVal = data?.[nowHour];
  const prevVal = data?.[prevHour];
  const nextVal = data?.[nextHour];

  const chartData = useMemo(() => {
    if (!data) {
      return { labels: [], datasets: [] as any[] };
    }

    // Цвета: текущий час — яркий, остальные — спокойные
    const base = token.colorPrimary; // из темы antd
    const muted = token.colorPrimaryBgHover; // светлее
    const bars = data.map((_, i) => (i === nowHour ? base : muted));

    return {
      labels,
      datasets: [
        {
          label: "Average Messages per Hour",
          data,
          backgroundColor: bars,
          borderRadius: 6,
          borderSkipped: false as const,
          barThickness: "flex" as const,
          maxBarThickness: 22,
        },
      ],
    };
  }, [data, labels, nowHour, token.colorPrimary, token.colorPrimaryBgHover]);

  const options = useMemo(
  () => ({
    maintainAspectRatio: false,
    animation: { duration: 300 },
    layout: { padding: { top: 6, right: 8, bottom: 0, left: 8 } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
        ticks: { color: "#7f7f7f", precision: 0 as const },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#7f7f7f", maxRotation: 0, autoSkip: true },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        displayColors: false,
        callbacks: {
          title: (items: any[]) => items?.[0]?.label ?? "",
          label: (ctx: any) => `Avg: ${ctx.parsed.y}`,
        },
      },
    },
  }),
  []
);

// ↓↓↓ ВЫНЕСЕНО ИЗ options
const currentHourLinePlugin = useMemo<Plugin<"bar">>(
  () => ({
    id: "currentHourLine",
    afterDatasetsDraw(chart) {
      const { ctx, scales } = chart;
      const x = (scales as any).x.getPixelForValue(nowHour);
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x, (scales as any).y.top);
      ctx.lineTo(x, (scales as any).y.bottom);
      ctx.stroke();
      ctx.restore();
    },
  }),
  [nowHour]
);

  const numberOrDash = (v: number | undefined) =>
    typeof v === "number" && Number.isFinite(v) ? Math.round(v) : "—";

  return (
    <Card
      bordered
      style={{
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Flex vertical gap={12} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between">
          <Title level={4} style={{ margin: 0 }}>
            Daily average
          </Title>
          <Text type="secondary">Local time • {hourLabel(nowHour)}</Text>
        </Flex>

        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : err ? (
          <Empty
            description={
              <Text type="secondary">
                Не смог загрузить данные: {err}
              </Text>
            }
          />
        ) : (
          <>
            <div style={{ height: 240 }}>
              <Bar ref={chartRef} data={chartData} options={options as any} />
            </div>

            <Flex gap={16} wrap="wrap">
              <Card size="small" style={{ flex: "1 1 160px" }}>
                <Statistic
                  title={`Prev (${hourLabel(prevHour)})`}
                  value={numberOrDash(prevVal)}
                />
              </Card>
              <Card
                size="small"
                style={{
                  flex: "1 1 160px",
                  borderColor: token.colorPrimary,
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.02) inset",
                }}
              >
                <Statistic
                  title={`Current (${hourLabel(nowHour)})`}
                  value={numberOrDash(currentVal)}
                  valueStyle={{ color: token.colorPrimary }}
                />
              </Card>
              <Card size="small" style={{ flex: "1 1 160px" }}>
                <Statistic
                  title={`Next (${hourLabel(nextHour)})`}
                  value={numberOrDash(nextVal)}
                />
              </Card>
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
};

export default ChannelDailyHistogramm;
