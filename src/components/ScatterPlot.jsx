import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { COLORS } from "../lib/colors";
import { formatDollars, formatRate } from "../lib/format";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-mc-stone rounded px-3 py-2 text-sm font-body shadow-sm">
      <p className="font-semibold text-mc-navy">{d.name}</p>
      <p className="text-mc-text">
        AV per Capita: {formatDollars(d.avPerCapita)}
      </p>
      <p className="text-mc-text">
        Adj. Tax Rate: {formatRate(d.taxRateAdj)}
      </p>
      {d.taxRateNominal != null && (
        <p className="text-mc-muted text-xs">
          Nominal Rate: {formatRate(d.taxRateNominal)} · Reval:{" "}
          {d.revalYear || "N/A"}
        </p>
      )}
    </div>
  );
}

export default function ScatterPlot({ peers, selectedName, municipalities }) {
  const peerData = [];
  const selectedData = [];

  for (const name of peers) {
    const m = municipalities[name];
    if (m.avPerCapita == null || m.taxRateAdj == null) continue;
    const point = {
      name,
      avPerCapita: m.avPerCapita,
      taxRateAdj: m.taxRateAdj,
      taxRateNominal: m.taxRateNominal,
      revalYear: m.revalYear,
    };
    if (name === selectedName) {
      selectedData.push(point);
    } else {
      peerData.push(point);
    }
  }

  if (peerData.length + selectedData.length < 2) {
    return (
      <div className="bg-mc-stone/50 border border-mc-stone rounded p-6 text-sm font-body text-mc-muted">
        Insufficient data for scatter plot comparison.
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.stone} />
          <XAxis
            type="number"
            dataKey="avPerCapita"
            name="AV per Capita"
            tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "K"}
            tick={{ fontSize: 11, fill: COLORS.muted }}
            stroke={COLORS.stone}
            label={{
              value: "Assessed Value per Capita",
              position: "bottom",
              offset: 5,
              style: { fontSize: 12, fill: COLORS.muted },
            }}
          />
          <YAxis
            type="number"
            dataKey="taxRateAdj"
            name="Adjusted Tax Rate"
            tickFormatter={(v) => "$" + v.toFixed(2)}
            tick={{ fontSize: 11, fill: COLORS.muted }}
            stroke={COLORS.stone}
            label={{
              value: "Adjusted Tax Rate (per $100 AV)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: {
                fontSize: 12,
                fill: COLORS.muted,
                textAnchor: "middle",
              },
            }}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name="Peers"
            data={peerData}
            fill={COLORS.peer}
            fillOpacity={0.6}
          />
          <Scatter
            name={selectedName}
            data={selectedData}
            fill={COLORS.accent}
            r={8}
          >
            <ZAxis range={[120, 120]} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs font-body text-mc-muted">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: COLORS.accent }}
          />
          {selectedName}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: COLORS.peer, opacity: 0.6 }}
          />
          Peers
        </div>
      </div>
    </div>
  );
}
