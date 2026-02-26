import { useState, useRef, useEffect, useMemo } from "react";
import { formatPopulation } from "../lib/format";

export default function MunicipalitySelector({
  municipalities,
  groups,
  selected,
  onSelect,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const names = useMemo(
    () => Object.keys(municipalities).sort(),
    [municipalities]
  );

  const filtered = useMemo(() => {
    if (!query) return names.slice(0, 20);
    const q = query.toLowerCase();
    return names.filter((n) => n.toLowerCase().includes(q)).slice(0, 20);
  }, [names, query]);

  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (name) => {
    onSelect(name);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const m = selected ? municipalities[selected] : null;
  const peerCount = m && m.group ? (groups[m.group]?.length || 0) - 1 : 0;

  return (
    <div className="mb-10">
      {/* Search */}
      <div className="relative max-w-md mx-auto mb-8">
        <label
          htmlFor="muni-search"
          className="block text-[11px] font-body font-semibold uppercase tracking-[0.18em] text-mc-brass mb-2"
        >
          Select a municipality
        </label>
        <input
          ref={inputRef}
          id="muni-search"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name..."
          className="w-full px-4 py-3 border border-mc-stone bg-white rounded font-body text-mc-text text-base focus:outline-none focus:ring-2 focus:ring-mc-brass/40 focus:border-mc-brass"
        />
        {isOpen && filtered.length > 0 && (
          <ul
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-mc-stone rounded shadow-lg max-h-60 overflow-y-auto"
          >
            {filtered.map((name) => (
              <li
                key={name}
                onClick={() => handleSelect(name)}
                className={`px-4 py-2.5 cursor-pointer text-sm font-body ${name === selected
                    ? "bg-mc-stone text-mc-navy font-semibold"
                    : "text-mc-text hover:bg-mc-cream"
                  }`}
              >
                {name}
                <span className="text-mc-muted ml-2 text-xs">
                  {municipalities[name].dominantCounty || ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Header Card */}
      {m && (
        <div className="relative bg-white border border-mc-stone rounded max-w-2xl mx-auto overflow-hidden">
          <div className="h-[3px] bg-mc-brass" />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-mc-navy">
                  {m.name}
                </h2>
                <p className="text-mc-muted mt-1 font-body">
                  {m.dominantCounty || "County not reported"} &middot; Pop.{" "}
                  {formatPopulation(m.population)}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 text-[11px] font-body font-semibold uppercase tracking-[0.12em] rounded bg-mc-stone text-mc-slate">
                  {m.group}
                </span>
                <p className="text-xs text-mc-muted mt-1.5 font-body">
                  {peerCount} peer{peerCount !== 1 ? "s" : ""} in group
                </p>
              </div>
            </div>

            {!m.hasAuditData && (
              <div className="mt-5 px-4 py-3 bg-mc-amber/10 border border-mc-amber/30 rounded text-sm text-mc-text font-body">
                <strong className="text-mc-navy">
                  Audit data not available.
                </strong>{" "}
                General Fund metrics (fund balance, revenues, expenditures) were
                not reported for this municipality. Tax rate comparisons are
                still shown below.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
