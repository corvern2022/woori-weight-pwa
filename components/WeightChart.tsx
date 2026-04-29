"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/types";

type Props = {
  data: ChartPoint[];
  showPartner: boolean;
  meLabel: string;
  partnerLabel: string;
};

function labelDate(iso: string): string {
  const parts = iso.slice(5).split('-');
  return `${parseInt(parts[0])}/${parseInt(parts[1])}`;
}

function renderDot(dataKey: "me" | "partner") {
  return function Dot(props: {
    cx?: number;
    cy?: number;
    payload?: ChartPoint;
    value?: number | null;
    index?: number;
  }) {
    const { cx, cy, payload, value, index } = props;
    if (cx == null || cy == null || value == null) {
      return (
        <circle
          key={`${dataKey}-empty-${payload?.date ?? "unknown"}-${index ?? 0}`}
          cx={-10}
          cy={-10}
          r={0}
          fill="none"
          stroke="none"
        />
      );
    }

    const drank = dataKey === "me" ? payload?.meDrank : payload?.partnerDrank;
    return (
      <circle
        key={`${dataKey}-${payload?.date ?? "unknown"}-${index ?? 0}`}
        cx={cx}
        cy={cy}
        r={4}
        stroke={dataKey === "me" ? "var(--accent-deep)" : "var(--duck-deep)"}
        strokeWidth={2}
        fill={drank ? "var(--peach-deep)" : "var(--card)"}
      />
    );
  };
}

export function WeightChart({ data, showPartner, meLabel, partnerLabel }: Props) {
  const [dismissed, setDismissed] = useState(false);

  function handleMouseMove() {
    // Reset dismiss state when hovering a new point
    if (dismissed) setDismissed(false);
  }

  function handleMouseLeave() {
    setDismissed(false);
  }

  function CustomTooltipContent(props: {
    active?: boolean;
    payload?: Array<{ name: string; value: number | null; color: string }>;
    label?: string;
  }) {
    const { active, payload, label } = props;
    if (!active || !payload?.length || dismissed) return null;

    const row = data.find(d => d.date === label);
    const drankNotes: string[] = [];
    if (row?.meDrank) drankNotes.push("나 음주");
    if (row?.partnerDrank) drankNotes.push("상대 음주");
    const titleLabel = drankNotes.length > 0 ? `${label} (${drankNotes.join(", ")})` : label;

    return (
      <div style={{
        background: 'var(--ink)',
        color: '#fff',
        borderRadius: 12,
        padding: '10px 14px 10px 12px',
        fontSize: 13,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        minWidth: 120,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-main)', fontSize: 12, opacity: 0.75 }}>{titleLabel}</span>
          <button
            onTouchEnd={(e) => { e.stopPropagation(); setDismissed(true); }}
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 11,
              flexShrink: 0,
              padding: 0,
            }}
          >✕</button>
        </div>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-main)', fontSize: 14 }}>
              {entry.name}: {entry.value == null ? '기록 없음' : `${Number(entry.value).toFixed(1)}kg`}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 11, fontFamily: 'var(--font-main)' }} interval={Math.max(0, Math.floor(data.length / 6))} />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12, fontFamily: 'var(--font-main)' }} />
          <Tooltip
            content={<CustomTooltipContent />}
            wrapperStyle={{ pointerEvents: 'auto', zIndex: 10 }}
          />
          <Line
            type="monotone"
            dataKey="me"
            name={meLabel}
            stroke="var(--accent-deep)"
            strokeWidth={3}
            dot={renderDot("me")}
            activeDot={{ r: 8 }}
            connectNulls={false}
          />
          {showPartner ? (
            <Line
              type="monotone"
              dataKey="partner"
              name={partnerLabel}
              stroke="var(--duck-deep)"
              strokeWidth={3}
              dot={renderDot("partner")}
              activeDot={{ r: 8 }}
              connectNulls={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
