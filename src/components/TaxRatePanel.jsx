import { useMemo } from "react";
import PeerBarChart from "./PeerBarChart";
import ScatterPlot from "./ScatterPlot";
import ContextCard from "./ContextCard";
import { COLORS } from "../lib/colors";
import { formatRate, formatDollars } from "../lib/format";

export default function TaxRatePanel({
  selected,
  municipalities,
  peerNames,
}) {
  const m = municipalities[selected];

  const peers = useMemo(() => {
    return peerNames
      .map((name) => ({
        name,
        value: municipalities[name].taxRateAdj,
      }))
      .filter((p) => p.value != null);
  }, [peerNames, municipalities]);

  const groupAvg = m.taxRateAdjGroupAvg;
  const stateAvg = m.taxRateAdjStateAvg;

  const referenceLines = [
    groupAvg != null && {
      value: groupAvg,
      label: `Group Avg (${formatRate(groupAvg)})`,
      color: COLORS.groupAvg,
    },
    stateAvg != null && {
      value: stateAvg,
      label: `State Avg (${formatRate(stateAvg)})`,
      color: COLORS.stateAvg,
    },
  ].filter(Boolean);

  const contextItems = [];
  if (m.taxRateAdj != null) {
    contextItems.push({
      label: "Adjusted Tax Rate",
      value: formatRate(m.taxRateAdj),
      note: "per $100 assessed value",
    });
  }
  if (m.taxRateNominal != null) {
    contextItems.push({
      label: "Nominal Tax Rate",
      value: formatRate(m.taxRateNominal),
    });
  }
  if (m.revalYear != null) {
    contextItems.push({
      label: "Latest Revaluation Year",
      value: String(m.revalYear),
    });
  }
  if (m.assessedValAdj != null) {
    contextItems.push({
      label: "Assessed Valuation (Adjusted)",
      value: formatDollars(m.assessedValAdj),
    });
  }
  if (m.avPerCapita != null) {
    contextItems.push({
      label: "AV per Capita",
      value: formatDollars(m.avPerCapita),
    });
  }

  let narrative = null;
  if (m.taxRateAdj != null) {
    const parts = [];
    if (groupAvg != null) {
      parts.push(
        `${m.taxRateAdj > groupAvg ? "above" : "below"} the group average (${formatRate(groupAvg)})`
      );
    }
    if (stateAvg != null) {
      parts.push(
        `${m.taxRateAdj > stateAvg ? "above" : "below"} the state average (${formatRate(stateAvg)})`
      );
    }
    narrative = `${m.name}'s adjusted tax rate is ${formatRate(m.taxRateAdj)} per $100 of assessed value`;
    if (parts.length) narrative += `, ${parts.join(" and ")}`;
    narrative += ".";
    if (m.taxRateNominal != null && m.taxRateAdj !== m.taxRateNominal) {
      narrative += ` The nominal rate (${formatRate(m.taxRateNominal)}) differs from the adjusted rate because the adjustment accounts for differences in revaluation timing across municipalities.`;
    }
  }

  if (m.taxRateAdj == null) {
    return (
      <section className="mb-12">
        <h3 className="text-xl font-display font-bold text-mc-navy mb-4">
          Tax Rate Comparison
        </h3>
        <div className="bg-mc-stone/50 border border-mc-stone rounded p-6 text-sm font-body text-mc-muted">
          Tax rate data was not reported for{" "}
          <strong className="text-mc-navy">{m.name}</strong>.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h3 className="text-xl font-display font-bold text-mc-navy mb-1">
        Tax Rate Comparison
      </h3>
      <p className="text-sm font-body text-mc-muted mb-5">
        Adjusted Tax Rate per $100 Assessed Value — {m.group}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <PeerBarChart
            peers={peers}
            selectedName={selected}
            metricLabel="Adj. Tax Rate"
            referenceLines={referenceLines}
            formatValue={(v) => (v != null ? "$" + v.toFixed(4) : "N/A")}
            municipalities={municipalities}
          />
        </div>
        <div>
          <ContextCard
            title={`${m.name} — Tax Rate`}
            items={contextItems}
            narrative={narrative}
          />
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-display font-semibold text-mc-navy mb-1">
          Tax Rate vs. Assessed Value
        </h4>
        <p className="text-sm font-body text-mc-muted mb-5">
          Are we a high-tax, low-wealth community or a low-tax, high-wealth one?
          Each dot is a municipality in the same peer group.
        </p>
        <ScatterPlot
          peers={peerNames}
          selectedName={selected}
          municipalities={municipalities}
        />
      </div>
    </section>
  );
}
