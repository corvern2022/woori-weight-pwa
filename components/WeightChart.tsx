"use client";

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
};

function labelDate(iso: string): string {
  return iso.slice(5);
}

function renderDot(dataKey: "me" | "partner") {
  return function Dot(props: {
    cx?: number;
    cy?: number;
    payload?: ChartPoint;
    value?: number | null;
  }) {
    const { cx, cy, payload, value } = props;
    if (cx == null || cy == null || value == null) return <circle cx={-10} cy={-10} r={0} />;

    const drank = dataKey === "me" ? payload?.meDrank : payload?.partnerDrank;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke={dataKey === "me" ? "#1677ff" : "#14b8a6"}
        strokeWidth={2}
        fill={drank ? "#ef4444" : "#ffffff"}
      />
    );
  };
}

export function WeightChart({ data, showPartner }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2f0" />
          <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 12 }} />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
              value == null ? "기록 없음" : `${Number(value).toFixed(1)}kg`
            }
            labelFormatter={(label, payload) => {
              const row = (payload?.[0]?.payload as ChartPoint | undefined) ?? null;
              const drankNotes: string[] = [];
              if (row?.meDrank) drankNotes.push("나 음주");
              if (row?.partnerDrank) drankNotes.push("상대 음주");
              return drankNotes.length > 0
                ? `${String(label)} (${drankNotes.join(", ")})`
                : String(label);
            }}
          />
          <Line
            type="monotone"
            dataKey="me"
            name="나"
            stroke="#1677ff"
            strokeWidth={3}
            dot={renderDot("me")}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
          {showPartner ? (
            <Line
              type="monotone"
              dataKey="partner"
              name="상대"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={renderDot("partner")}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
