import { useMemo } from "react";
import { useData } from "./hooks/useData";
import { useQueryParam } from "./hooks/useQueryParam";
import MunicipalitySelector from "./components/MunicipalitySelector";
import FundBalancePanel from "./components/FundBalancePanel";
import TaxRatePanel from "./components/TaxRatePanel";
import Footer from "./components/Footer";

export default function App() {
  const { data, loading, error } = useData();
  const [unit, setUnit] = useQueryParam("unit");

  const selected = useMemo(() => {
    if (!data || !unit) return null;
    const exact = data.municipalities[unit];
    if (exact) return unit;
    const lower = unit.toLowerCase();
    const match = Object.keys(data.municipalities).find(
      (k) => k.toLowerCase() === lower
    );
    return match || null;
  }, [data, unit]);

  const peerNames = useMemo(() => {
    if (!data || !selected) return [];
    const group = data.municipalities[selected]?.group;
    return group ? data.groups[group] || [] : [];
  }, [data, selected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mc-cream">
        <p className="text-mc-muted text-lg font-body">Loading fiscal data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mc-cream">
        <p className="text-red-700 font-body">
          Failed to load data: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mc-cream">
      {/* Header */}
      <header className="bg-mc-navy text-white py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <h1 className="text-3xl font-display font-bold tracking-tight">
            NC Municipal Fiscal Health Comparator
          </h1>
          <p className="text-mc-stone mt-2 text-sm font-body font-medium tracking-wide">
            Peer benchmarking using NC Local Government Commission AFIR data
            <span className="text-mc-brass ml-2">&middot;</span>
            <span className="text-mc-brass ml-2">{data.metadata.fiscalYear}</span>
          </p>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <MunicipalitySelector
          municipalities={data.municipalities}
          groups={data.groups}
          selected={selected}
          onSelect={setUnit}
        />

        {selected && (
          <>
            <FundBalancePanel
              selected={selected}
              municipalities={data.municipalities}
              peerNames={peerNames}
            />
            <TaxRatePanel
              selected={selected}
              municipalities={data.municipalities}
              peerNames={peerNames}
            />
          </>
        )}

        {!selected && (
          <div className="text-center py-20">
            <p className="text-mc-muted text-lg font-body">
              Select a municipality above to see fiscal health comparisons.
            </p>
            <p className="text-mc-muted/60 text-sm mt-2 font-body">
              {data.metadata.totalMunicipalities} NC municipalities available
            </p>
          </div>
        )}
      </main>

      <Footer metadata={data.metadata} />
    </div>
  );
}
