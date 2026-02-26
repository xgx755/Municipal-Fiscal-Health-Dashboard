import { useMemo } from "react";
import PeerBarChart from "./PeerBarChart";
import ContextCard from "./ContextCard";
import { COLORS } from "../lib/colors";
import { formatPctValue, formatCompact, formatDollars } from "../lib/format";

export default function FundBalancePanel({
  selected,
  municipalities,
  peerNames,
}) {
  const m = municipalities[selected];

  const peers = useMemo(() => {
    return peerNames
      .map((name) => ({
        name,
        value:
          municipalities[name].fbaPct != null
            ? municipalities[name].fbaPct * 100
            : null,
      }))
      .filter((p) => p.value != null);
  }, [peerNames, municipalities]);

  const groupAvg =
    m.fbaPctGroupAvg != null ? m.fbaPctGroupAvg * 100 : null;
  const stateAvg =
    m.fbaPctStateAvg != null ? m.fbaPctStateAvg * 100 : null;
  const unitFba = m.fbaPct != null ? m.fbaPct * 100 : null;

  const referenceLines = [
    { value: 8, label: "LGC 8% Min", color: COLORS.lgcMin },
    groupAvg != null && {
      value: groupAvg,
      label: `Group Avg (${groupAvg.toFixed(1)}%)`,
      color: COLORS.groupAvg,
    },
    stateAvg != null && {
      value: stateAvg,
      label: `State Avg (${stateAvg.toFixed(1)}%)`,
      color: COLORS.stateAvg,
    },
  ].filter(Boolean);

  const contextItems = [];
  if (m.fbaDollars != null) {
    contextItems.push({
      label: "Fund Balance Available",
      value: formatCompact(m.fbaDollars),
    });
  }
  if (unitFba != null) {
    contextItems.push({
      label: "FBA as % of Net Expenditures",
      value: formatPctValue(unitFba),
      note:
        unitFba >= 8
          ? "Above LGC minimum"
          : "Below LGC 8% minimum",
    });
  }
  if (m.gfExcess != null) {
    contextItems.push({
      label: "Operating Surplus / (Deficit)",
      value: formatCompact(m.gfExcess),
      note: m.gfExcess >= 0 ? "Surplus" : "Deficit",
    });
  }
  if (m.gfRevenues != null) {
    contextItems.push({
      label: "GF Revenues",
      value: formatCompact(m.gfRevenues),
    });
  }
  if (m.gfExpenditures != null) {
    contextItems.push({
      label: "GF Expenditures",
      value: formatCompact(m.gfExpenditures),
    });
  }

  let narrative = null;
  if (unitFba != null) {
    const vs = [];
    if (groupAvg != null) {
      vs.push(
        `${unitFba > groupAvg ? "above" : "below"} the group average (${groupAvg.toFixed(1)}%)`
      );
    }
    if (stateAvg != null) {
      vs.push(
        `${unitFba > stateAvg ? "above" : "below"} the state average (${stateAvg.toFixed(1)}%)`
      );
    }
    narrative = `${m.name}'s fund balance covers ${unitFba.toFixed(1)}% of annual net expenditures`;
    if (vs.length) narrative += `, ${vs.join(" and ")}`;
    narrative +=
      unitFba >= 8
        ? ". This exceeds the LGC's recommended minimum of 8%."
        : ". This is below the LGC's recommended minimum of 8%.";
  }

  if (!m.hasAuditData) {
    return (
      <section className="mb-12">
        <h3 className="text-xl font-display font-bold text-mc-navy mb-4">
          Fund Balance Comparison
        </h3>
        <div className="bg-mc-stone/50 border border-mc-stone rounded p-6 text-sm font-body text-mc-muted">
          Fund balance data requires an audit submission.{" "}
          <strong className="text-mc-navy">{m.name}</strong> has not submitted
          audit data for{" "}
          {m.fbaPctGroupAvg != null ? (
            <>
              the current fiscal year. The group average FBA is{" "}
              <strong className="text-mc-navy">{formatPctValue(groupAvg)}</strong>{" "}
              and the state average is{" "}
              <strong className="text-mc-navy">{formatPctValue(stateAvg)}</strong>.
            </>
          ) : (
            "the current fiscal year."
          )}
        </div>
      </section>
    );
  }

  if (peers.length < 2) {
    return (
      <section className="mb-12">
        <h3 className="text-xl font-display font-bold text-mc-navy mb-4">
          Fund Balance Comparison
        </h3>
        <div className="bg-mc-stone/50 border border-mc-stone rounded p-6 text-sm font-body text-mc-muted">
          Only {peers.length} municipality in this population group has reported
          fund balance data. Comparison charts require at least 2 peers.
        </div>
        {contextItems.length > 0 && (
          <div className="mt-4">
            <ContextCard
              title={`${m.name} — Fund Balance`}
              items={contextItems}
              narrative={narrative}
            />
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h3 className="text-xl font-display font-bold text-mc-navy mb-1">
        Fund Balance Comparison
      </h3>
      <p className="text-sm font-body text-mc-muted mb-5">
        Fund Balance Available as % of General Fund Net Expenditures — {m.group}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PeerBarChart
            peers={peers}
            selectedName={selected}
            metricLabel="FBA %"
            referenceLines={referenceLines}
            formatValue={(v) => (v != null ? v.toFixed(1) + "%" : "N/A")}
            municipalities={municipalities}
          />
        </div>
        <div>
          <ContextCard
            title={`${m.name} — Fund Balance`}
            items={contextItems}
            narrative={narrative}
          />
        </div>
      </div>
    </section>
  );
}
