// Adapted from animata.design "Marquee" (credit: hari). Plain CSS keyframes version.
export default function Marquee({
  children,
  reverse = false,
  duration = "28s",
  className = "",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: string;
  className?: string;
}) {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div
        className={`marquee-track flex w-max shrink-0 ${reverse ? "reverse" : ""}`}
        style={{ "--duration": duration } as React.CSSProperties}
      >
        {[0, 1].map((i) => (
          <div key={i} className="flex shrink-0 items-center" style={{ gap: "var(--gap, 12px)" }} aria-hidden={i === 1}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
