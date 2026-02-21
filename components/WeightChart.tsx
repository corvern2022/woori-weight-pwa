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
            labelFormatter={(label) => String(label)}
          />
          <Line
            type="monotone"
            dataKey="me"
            name="나"
            stroke="#1677ff"
            strokeWidth={3}
            dot={{ r: 4 }}
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
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
