export default function ContextCard({ title, items, narrative }) {
  return (
    <div className="relative bg-white border border-mc-stone rounded overflow-hidden h-full">
      <div className="h-[3px] bg-mc-brass" />
      <div className="p-5">
        {title && (
          <h4 className="text-[11px] font-body font-semibold uppercase tracking-[0.18em] text-mc-brass mb-4">
            {title}
          </h4>
        )}
        <dl className="space-y-3">
          {items.map((item, i) => (
            <div key={i}>
              <dt className="text-xs font-body text-mc-muted">{item.label}</dt>
              <dd className="text-lg font-display font-semibold text-mc-navy">
                {item.value}
                {item.note && (
                  <span className="text-xs font-body font-normal text-mc-muted ml-2">
                    {item.note}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {narrative && (
          <p className="mt-4 text-sm font-body text-mc-text leading-relaxed border-t border-mc-stone pt-4">
            {narrative}
          </p>
        )}
      </div>
    </div>
  );
}
