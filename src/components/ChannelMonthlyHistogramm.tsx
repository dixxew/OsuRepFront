import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import type { Plugin } from "chart.js";
import { Card, Flex, Skeleton, Empty, Typography, theme } from "antd";

const { Title, Text } = Typography;

interface DailyMessageCount {
  date: string;
  messageCount: number;
}

const fmtLabel = (d: Date, withYear = false) =>
  new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "2-digit" } : {}),
  }).format(d);

const ChannelMonthlyHistogramm: React.FC = () => {
  const [values, setValues] = useState<number[] | null>(null);
  const [dates, setDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { token } = theme.useToken();
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await axios.get<DailyMessageCount[]>(
          "https://osu.dixxew.ru/api/Message/GetMonthlyMessageCounts"
        );

        const raw = (resp.data ?? []).slice().sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (!mounted) return;
        setValues(raw.map((x) => x.messageCount));
        setDates(raw.map((x) => new Date(x.date)));
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "Failed to load monthly histogram data");
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
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  }, []);

  const labels = useMemo(() => {
    if (!dates.length) return [];
    const yearSet = new Set(dates.map((d) => d.getFullYear()));
    const singleYear = yearSet.size === 1;

    return dates.map((d) => fmtLabel(d, !singleYear));
  }, [dates]);

  const chartData = useMemo(() => {
    if (!values) return { labels: [], datasets: [] as any[] };

    // Цвета для графика — спокойные и современные
    const base = token.colorPrimaryBg;          // светлая основа
    const accent = token.colorPrimary;          // подсветка "сегодня"
    const gradientCache: any = {};

    return {
      labels,
      datasets: [
        {
          label: "Messages per Day",
          data: values,
          backgroundColor: (ctx: any) => {
            const idx = ctx.dataIndex;
            const d = dates[idx];
            if (!d) return base;

            const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const isToday = key === todayKey;

            const chart = ctx.chart;
            const { ctx: gctx, chartArea } = chart;

            if (!chartArea) return base;

            const cacheKey = isToday ? "today" : "normal";
            if (gradientCache[cacheKey]) return gradientCache[cacheKey];

            const gradient = gctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            if (isToday) {
              gradient.addColorStop(0, accent);
              gradient.addColorStop(1, accent + "CC");
            } else {
              gradient.addColorStop(0, base);
              gradient.addColorStop(1, base + "AA");
            }
            gradientCache[cacheKey] = gradient;
            return gradient;
          },
          borderRadius: 6,
          borderSkipped: false,
          barThickness:  "flex" as any,
          maxBarThickness: 22,
        },
      ],
    };
  }, [values, dates, labels, todayKey, token.colorPrimary, token.colorPrimaryBg]);

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      animation: { duration: 300, easing: "easeOutQuart" },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
          ticks: { color: "#999", precision: 0 },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#aaa", maxRotation: 0, autoSkip: true, autoSkipPadding: 6 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          cornerRadius: 6,
          padding: 10,
          titleFont: { weight: "600" },
          displayColors: false,
          callbacks: {
            title: (items: any[]) => {
              const idx = items?.[0]?.dataIndex ?? 0;
              const d = dates[idx];
              if (!d) return "";
              return new Intl.DateTimeFormat(undefined, {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(d);
            },
            label: (ctx: any) => `Messages: ${ctx.parsed.y}`,
          },
        },
      },
    }),
    [dates]
  );

  // вертикальная линия на "сегодня"
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
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(x, scales.y.top);
        ctx.lineTo(x, scales.y.bottom);
        ctx.stroke();
        ctx.restore();
      },
    }),
    [dates, todayKey]
  );

  const rangeLabel = dates.length
    ? `${new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
        dates[0]
      )} — ${new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(dates[dates.length - 1])}`
    : null;

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
      <Flex vertical gap={16} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between">
          <Title level={4} style={{ margin: 0 }}>
            Monthly messages
          </Title>
          <Text type="secondary">{rangeLabel ?? "No data"}</Text>
        </Flex>

        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : err ? (
          <Empty description={<Text type="secondary">{err}</Text>} />
        ) : (
          <div style={{ height: 220 }}>
            <Bar
              ref={chartRef}
              data={chartData}
              options={options as any}
              plugins={[todayLinePlugin]}
            />
          </div>
        )}
      </Flex>
    </Card>
  );
};

export default ChannelMonthlyHistogramm;
