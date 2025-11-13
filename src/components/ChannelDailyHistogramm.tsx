import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import {
  Card,
  Flex,
  Skeleton,
  Statistic,
  Typography,
  Empty,
  theme,
} from "antd";
import type { Plugin, ChartData, ChartDataset } from "chart.js";

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

  const { token } = theme.useToken();
  const chartRef = useRef<any>(null);

  const nowHour = new Date().getHours();
  const prevHour = wrap24(nowHour - 1);
  const nextHour = wrap24(nowHour + 1);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const resp = await axios.get<HourlyAverageMessageCount[]>(
          "https://osu.dixxew.ru/api/Message/GetDailyMessageCounts"
        );

        const raw = resp.data ?? [];

        const normalized = Array.from({ length: HOUR_COUNT }, (_, h) => {
          const item = raw.find((x) => x.hour === h);
          return item ? item.averageMessageCount : 0;
        });

        if (!mounted) return;

        setData(normalized);
        setLabels(Array.from({ length: HOUR_COUNT }, (_, h) => hourLabel(h)));
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Failed to load histogram data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const chartData: ChartData<"bar"> = useMemo(() => {
    if (!data) {
      return { labels: [] as string[], datasets: [] as ChartDataset<"bar">[] };
    }

    const base = token.colorPrimaryBgHover;
    const accent = token.colorPrimary;

    return {
      labels,
      datasets: [
        {
          label: "Average Messages per Hour",
          data,
          backgroundColor: (ctx) => {
            const i = ctx.dataIndex;
            return i === nowHour ? accent : base;
          },
          borderRadius: 6,
          borderSkipped: false,
          barThickness: "flex" as any,
          maxBarThickness: 22,
        },
      ],
    };
  }, [data, labels, nowHour, token.colorPrimary, token.colorPrimaryBgHover]);

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      animation: { duration: 280, easing: "easeOutQuart" },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
          ticks: { color: "#9a9a9a", precision: 0 },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#9a9a9a", maxRotation: 0, autoSkip: true },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (items: any[]) => items[0]?.label ?? "",
            label: (ctx: any) => `Avg: ${ctx.parsed.y}`,
          },
        },
      },
    }),
    []
  );

  const currentHourLinePlugin = useMemo<Plugin<"bar">>(
    () => ({
      id: "currentHourLine",
      afterDatasetsDraw(chart) {
        const { ctx, scales } = chart as any;
        const x = scales.x.getPixelForValue(nowHour);
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(x, scales.y.top);
        ctx.lineTo(x, scales.y.bottom);
        ctx.stroke();
        ctx.restore();
      },
    }),
    [nowHour]
  );

  const currentVal = data?.[nowHour];
  const prevVal = data?.[prevHour];
  const nextVal = data?.[nextHour];

  const clamp = (v: number | undefined) =>
    typeof v === "number" && Number.isFinite(v) ? Math.round(v) : "—";

  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        background: "#11141a",
        borderRadius: 16,
        boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Flex vertical gap={16} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between">
          <Title level={4} style={{ margin: 0 }}>
            Daily average
          </Title>
          <Text type="secondary">Local time • {hourLabel(nowHour)}</Text>
        </Flex>

        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : err ? (
          <Empty description={<Text type="secondary">{err}</Text>} />
        ) : (
          <>
            <div style={{ height: 240 }}>
              <Bar
                ref={chartRef}
                data={chartData}
                options={options as any}
                plugins={[currentHourLinePlugin]}
              />
            </div>

            <Flex gap={12} wrap="wrap">
              {/* PREVIOUS */}
              <Card
                size="small"
                bodyStyle={{ padding: "8px 12px" }}
                style={{ flex: "1 1 120px", background: "#191c23" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Prev
                </Text>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>
                  {clamp(prevVal)}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {hourLabel(prevHour)}
                </Text>
              </Card>

              {/* CURRENT */}
              <Card
                size="small"
                bodyStyle={{ padding: "8px 12px" }}
                style={{
                  flex: "1 1 120px",
                  background: "#191c23",
                  borderColor: token.colorPrimary,
                  boxShadow: `0 0 10px ${token.colorPrimary}33`,
                }}
              >
                <Text style={{ fontSize: 12, color: token.colorPrimary }}>
                  Current
                </Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginTop: 2,
                    color: token.colorPrimary,
                  }}
                >
                  {clamp(currentVal)}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {hourLabel(nowHour)}
                </Text>
              </Card>

              {/* NEXT */}
              <Card
                size="small"
                bodyStyle={{ padding: "8px 12px" }}
                style={{ flex: "1 1 120px", background: "#191c23" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Next
                </Text>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>
                  {clamp(nextVal)}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {hourLabel(nextHour)}
                </Text>
              </Card>
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
};

export default ChannelDailyHistogramm;
