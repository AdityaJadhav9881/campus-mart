import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Cpu,
  Layers,
  Maximize2,
  Scan,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const ANGLES = [
  {
    id: "front",
    name: "Front Face",
    detail: "Keypad & LCD Screen",
    grade: "Grade A+ (Scratch-Free)",
    confidence: "99.4%",
    image:
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    tags: ["Casio fx-991", "Display Clear", "Buttons Responsive"],
  },
  {
    id: "back",
    name: "Back Housing",
    detail: "Serial & Battery Seal",
    grade: "Original Casio QR Seal Intact",
    confidence: "98.8%",
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    tags: ["Serial Verified", "Clean Battery Bay", "Model 2024"],
  },
  {
    id: "edges",
    name: "Slide Cover",
    detail: "Corners & Clamps",
    grade: "Snug Fit · Zero Cracks",
    confidence: "97.9%",
    image:
      "https://images.unsplash.com/photo-1611117765103-68d6f51fba05?auto=format&fit=crop&w=800&q=80",
    tags: ["Hard Case Included", "Corner Integrity: 100%"],
  },
  {
    id: "wear",
    name: "Self-Test Mode",
    detail: "Internal Diagnostics",
    grade: "All 192 LCD Segments Pass",
    confidence: "99.9%",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    tags: ["Math Matrix Pass", "Solar Cell Active"],
  },
];

export default function HeroGraphic() {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const active = ANGLES[activeAngleIndex];
  const isFailed = failedImages[active.id];

  return (
    <div className="relative mx-auto w-full max-w-lg min-w-0 overflow-hidden select-none">
      {/* Decorative ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-accent/15 via-positive/10 to-transparent blur-2xl"
      />

      {/* Main Graphic Frame / Device Inspection Viewfinder */}
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-card shadow-[0_20px_50px_-15px_rgba(28,25,23,0.18)] transition-all duration-300">
        {/* Viewfinder Top Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-line bg-sunken/80 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xs min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-positive live-dot" />
            <span className="font-mono text-[10.5px] sm:text-[11px] font-medium tracking-wide text-ink uppercase truncate">
              AI Vision Lens · 4-Angle Scan
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[10.5px] text-faint shrink-0">
            <Cpu className="h-3 w-3 text-accent" />
            <span>CONF: {active.confidence}</span>
          </div>
        </div>

        {/* Viewfinder Image Stage */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-ink/95">
          {!isFailed ? (
            <img
              src={active.image}
              alt={active.name}
              onError={() =>
                setFailedImages((prev) => ({ ...prev, [active.id]: true }))
              }
              className="h-full w-full object-cover opacity-90 transition-all duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-6 text-center text-paper">
              <span className="font-mono text-xs text-paper/70 tracking-widest uppercase">
                [4-Angle Reticle Active · {active.name}]
              </span>
            </div>
          )}

          {/* Viewfinder Reticle Overlays */}
          <div className="pointer-events-none absolute inset-0 p-4">
            {/* Corner Crosshairs */}
            <div className="absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-accent" />
            <div className="absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-accent" />
            <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-accent" />
            <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-accent" />

            {/* Target Cross Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Scan className="h-10 w-10 text-accent/40 animate-pulse" />
            </div>

            {/* Laser Scan Line */}
            <div
              className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_12px_#2563eb]"
              style={{
                animation: "laser-sweep 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />

            {/* Floating Visual AI Inspection Tags */}
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-accent" />
                <span>Angle: {active.name}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-positive/30 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-positive backdrop-blur-md">
                <Check className="h-3 w-3" />
                {active.grade}
              </span>
            </div>

            {/* Floating Live AI Price Callout Badge */}
            <div className="absolute right-4 bottom-4 rounded-xl border border-white/20 bg-black/75 p-2.5 text-right backdrop-blur-md shadow-lg">
              <p className="text-[10px] uppercase tracking-wider text-white/70">
                AI Suggested Price
              </p>
              <p className="font-sans text-xl font-bold tabular-nums text-white">
                ₹650
              </p>
              <span className="inline-block rounded-full bg-positive/30 px-1.5 py-0.2 text-[9.5px] font-semibold text-positive-soft">
                38% below MRP
              </span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Angle Selector Strip */}
        <div className="grid grid-cols-4 gap-1.5 border-t border-line bg-paper p-3">
          {ANGLES.map((angle, idx) => {
            const isSelected = idx === activeAngleIndex;
            return (
              <button
                key={angle.id}
                type="button"
                onClick={() => setActiveAngleIndex(idx)}
                className={`relative flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all ${
                  isSelected
                    ? "border-accent bg-accent-soft/70 shadow-xs"
                    : "border-line bg-card hover:border-line-strong hover:bg-sunken"
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sunken text-[10px] font-bold text-ink">
                  0{idx + 1}
                </div>
                <span className="text-[11px] font-medium text-ink leading-tight">
                  {angle.name.split(" ")[0]}
                </span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Inspection Metadata Bar */}
        <div className="flex items-center justify-between gap-2 border-t border-line bg-card px-3 sm:px-4 py-2.5 text-xs text-muted min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
            <ShieldCheck className="h-4 w-4 shrink-0 text-positive" />
            <span className="font-medium text-ink truncate">Verified Student Seller</span>
            <span className="text-faint truncate hidden sm:inline">· DACOE Karad</span>
          </div>

          <span className="shrink-0 flex items-center gap-1 font-semibold text-warn">
            ★ 4.9 <span className="text-faint font-normal">/ 5</span>
          </span>
        </div>
      </div>
    </div>
  );
}

