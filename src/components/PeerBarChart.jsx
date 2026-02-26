import { useRef, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COLORS } from "../lib/colors";

function CustomTooltip({ active, payload, formatValue, municipalities }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const m = municipalities?.[d.name];
  return (
    <div className="bg-white border border-mc-stone rounded px-3 py-2 text-sm font-body shadow-sm">
      <p className="font-semibold text-mc-navy">{d.name}</p>
      <p className="text-mc-text">{formatValue(d.value)}</p>
      {m && (
        <p className="text-mc-muted text-xs">
          Pop. {m.population?.toLocaleString() || "N/A"}
          {!m.hasAuditData && " · Audit data not reported"}
        </p>
      )}
    </div>
  );
}

export default function PeerBarChart({
  peers,
  selectedName,
  metricLabel,
  referenceLines = [],
  formatValue,
  municipalities,
  domainMax,
}) {
  const containerRef = useRef(null);

  const sorted = useMemo(() => {
    return [...peers].sort((a, b) => {
      if (a.value == null && b.value == null) return 0;
      if (a.value == null) return 1;
      if (b.value == null) return -1;
      return b.value - a.value;
    });
  }, [peers]);

  const selectedIndex = sorted.findIndex((p) => p.name === selectedName);

  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const barHeight = 28;
      const offset = selectedIndex * barHeight;
      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      if (
        offset > containerHeight - barHeight ||
        offset < container.scrollTop
      ) {
        container.scrollTop = Math.max(0, offset - containerHeight / 2);
      }
    }
  }, [selectedIndex]);

  const chartHeight = Math.max(400, sorted.length * 28);
  const maxScroll = 600;

  // Compute x-axis domain — use actual data min, not Recharts "auto" which over-pads
  const values = sorted.map((p) => p.value).filter((v) => v != null);
  const refValues = referenceLines.map((r) => r.value);
  const minVal = values.length > 0 ? Math.min(0, ...values) : 0;
  const maxVal = domainMax || Math.max(...values, ...refValues) * 1.1;

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight: sorted.length > 20 ? maxScroll : "none" }}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={sorted}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.stone} />
            <XAxis
              type="number"
              domain={[minVal, maxVal]}
              tickFormatter={formatValue}
              tick={{ fontSize: 11, fill: COLORS.muted }}
              stroke={COLORS.stone}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 11, fill: COLORS.text }}
              interval={0}
              stroke={COLORS.stone}
            />
            <Tooltip
              content={
                <CustomTooltip
                  formatValue={formatValue}
                  municipalities={municipalities}
                />
              }
            />
            {referenceLines.map((ref, i) => (
              <ReferenceLine
                key={i}
                x={ref.value}
                stroke={ref.color}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: ref.label,
                  position: "top",
                  fill: ref.color,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            ))}
            <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={18}>
              {sorted.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === selectedName ? COLORS.accent : COLORS.peer
                  }
                  fillOpacity={
                    municipalities?.[entry.name]?.hasAuditData === false
                      ? 0.4
                      : entry.name === selectedName
                        ? 1
                        : 0.7
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs font-body text-mc-muted">
        {referenceLines.map((ref, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 border-t-2 border-dashed"
              style={{ borderColor: ref.color }}
            />
            {ref.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.accent }}
          />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.peer, opacity: 0.7 }}
          />
          Peers
        </div>
      </div>
    </div>
  );
}
