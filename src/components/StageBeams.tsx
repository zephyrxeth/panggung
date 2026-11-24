// StageBeams — animata "Animated Beam" remixed: red meteors, hot spotlight, flicker.
const prand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (min: number, max: number, t: number) => min + (max - min) * t;
const LANES = 48;

function Beam({ index }: { index: number }) {
  const fast = prand(index + 91) < 0.35;
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
        <div className="h-full w-full bg-gradient-to-b from-red-100/60 via-red-400/90 to-red-100" />
      </div>
    </div>
  );
}

export default function StageBeams() {
  return (
    <div className="absolute inset-0 z-0 flex flex-row justify-center overflow-hidden bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#180a0a]">
      {/* hot spotlight from the floor */}
      <div
        className="pulse-glow absolute inset-x-0 bottom-0 h-3/4"
        style={{ background: "radial-gradient(65% 70% at 50% 105%, rgba(239,68,68,0.5) 0%, rgba(185,28,28,0.18) 45%, rgba(185,28,28,0) 100%)" }}
      />
      {/* faint floor haze */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 opacity-40"
        style={{ background: "radial-gradient(80% 100% at 50% 100%, rgba(220,38,38,0.25) 0%, rgba(220,38,38,0) 100%)" }}
      />
      {Array.from({ length: LANES }, (_, i) => (
        <div key={i} className="flex h-full w-10 shrink-0 justify-center">
          <div className="relative h-full w-px rotate-12 bg-red-100/[0.07]">
            {prand(i + 7) < 0.35 && <Beam index={i + 1} />}
          </div>
        </div>
      ))}
    </div>
  );
}
