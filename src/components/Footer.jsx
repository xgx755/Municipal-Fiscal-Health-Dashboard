export default function Footer({ metadata }) {
  return (
    <footer className="mt-16 py-10 border-t border-mc-stone bg-white">
      <div className="max-w-[1100px] mx-auto px-6 text-xs font-body text-mc-muted space-y-2">
        <p>
          <strong className="text-mc-text">Data Source:</strong> NC Local
          Government Commission, Annual Financial Information Report (AFIR),{" "}
          {metadata?.fiscalYear || "FY 2024-2025"}. Tax and valuation data from
          NC Department of Revenue. Population estimates from NC Office of State
          Budget and Management.
        </p>
        <p>
          <strong className="text-mc-text">Data Limitations:</strong>{" "}
          Approximately 35% of municipalities submitted audit-level data only
          and do not have General Fund revenue breakdown metrics. These
          municipalities are included in tax rate comparisons but are flagged
          where fund balance data is unavailable. Debt data is not included in
          the AFIR dataset and is excluded from this version.
        </p>
        {metadata?.generatedAt && (
          <p>
            Last updated:{" "}
            {new Date(metadata.generatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </footer>
  );
}
