// Adapted from animata.design "Animated Beam" (MIT-style credit: built by hari)
// Diagonal meteor streaks on faint lanes — pure CSS, deterministic, no runtime JS.
const prand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (min: number, max: number, t: number) => min + (max - min) * t;
const LANES = 48;

function Beam({ index }: { index: number }) {
  const fast = prand(index + 91) < 0.3;
  const duration = fast ? lerp(1.2, 3.2, prand(index)) : lerp(6, 14, prand(index));
  const delay = lerp(0, 9, prand(index + 13));
  const length = Math.round(lerp(24, 84, prand(index + 29)));
  const width = Math.round(lerp(3, 7, prand(index + 53)));
  const opacity = fast ? lerp(0.8, 1, prand(index + 71)) : lerp(0.35, 0.9, prand(index + 71));

  return (
    <div
      className="beam h-full"
      style={{
        "--duration": `${duration.toFixed(2)}s`,
        "--delay": `${delay.toFixed(2)}s`,
        "--opacity": opacity.toFixed(2),
        width: `${width}px`,
        transform: "translateY(-20%)",
      } as React.CSSProperties}
    >
      <div
        className="w-full"
        style={{ height: `${length}px`, clipPath: "polygon(54% 0, 54% 0, 60% 100%, 40% 100%)" }}
      >
        <div className="h-full w-full bg-gradient-to-b from-red-100/60 via-red-300/80 to-red-100" />
      </div>
    </div>
  );
}

export default function StageBeams() {
  return (
    <div className="absolute inset-0 z-0 flex flex-row justify-center overflow-hidden bg-gradient-to-t from-stone-950 via-stone-950 to-stone-900">
      {/* warm spotlight glow from the stage floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 opacity-30"
        style={{ background: "radial-gradient(60% 60% at 50% 100%, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0.08) 45%, rgba(251,191,36,0) 100%)" }}
      />
      {Array.from({ length: LANES }, (_, i) => (
        <div key={i} className="flex h-full w-10 shrink-0 justify-center">
          <div className="relative h-full w-px rotate-12 bg-red-100/[0.06]">
            {prand(i + 7) < 0.32 && <Beam index={i + 1} />}
          </div>
        </div>
      ))}
    </div>
  );
}
