import {
  BookOpen,
  Compass,
  Cpu,
  FlaskConical,
  Laptop,
  Moon,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "../router/router.jsx";

const CATEGORIES = [
  {
    id: "books",
    title: "Textbooks & Notes",
    subtitle: "M1, M2, Nirali, TechMax & SPPU/SUK syllabus",
    count: "140+ active",
    badge: "50–70% Off MRP",
    icon: BookOpen,
    accent: "from-amber-500/10 to-orange-500/5 text-amber-700 border-amber-500/20",
    badgeColor: "bg-amber-100/80 text-amber-800 border-amber-300/40",
    searchCategory: "Academic Material",
  },
  {
    id: "tools",
    title: "Engineering Tools",
    subtitle: "Mini drafters, Casio fx-991CW, drawing sheets",
    count: "45+ active",
    badge: "Submission Ready",
    icon: Compass,
    accent: "from-blue-500/10 to-cyan-500/5 text-blue-700 border-blue-500/20",
    badgeColor: "bg-blue-100/80 text-blue-800 border-blue-300/40",
    searchCategory: "Academic Material",
  },
  {
    id: "tech",
    title: "Laptops & Gadgets",
    subtitle: "ANC headphones, keyboards, Bluetooth audio",
    count: "35+ active",
    badge: "4-Angle Verified",
    icon: Laptop,
    accent: "from-purple-500/10 to-indigo-500/5 text-purple-700 border-purple-500/20",
    badgeColor: "bg-purple-100/80 text-purple-800 border-purple-300/40",
    searchCategory: "Electronics",
  },
  {
    id: "lab",
    title: "Lab Coats & Pharma",
    subtitle: "Clean white aprons, dissection boxes, safety kits",
    count: "28+ active",
    badge: "Sanitized",
    icon: FlaskConical,
    accent: "from-emerald-500/10 to-teal-500/5 text-emerald-700 border-emerald-500/20",
    badgeColor: "bg-emerald-100/80 text-emerald-800 border-emerald-300/40",
    searchCategory: "Lab Equipment",
  },
  {
    id: "electronics",
    title: "Electronics & IoT",
    subtitle: "Arduino Uno, multimeters, breadboards, sensors",
    count: "42+ active",
    badge: "Tested Circuits",
    icon: Cpu,
    accent: "from-rose-500/10 to-pink-500/5 text-rose-700 border-rose-500/20",
    badgeColor: "bg-rose-100/80 text-rose-800 border-rose-300/40",
    searchCategory: "Electronics",
  },
  {
    id: "hostel",
    title: "Hostel Essentials",
    subtitle: "Electric kettles, study lamps, hangers, racks",
    count: "50+ active",
    badge: "Zero Packaging",
    icon: Moon,
    accent: "from-stone-500/10 to-amber-500/5 text-stone-700 border-stone-500/20",
    badgeColor: "bg-stone-200/80 text-stone-800 border-stone-300/40",
    searchCategory: "Hostel Gear",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl min-w-0 overflow-hidden px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="eyebrow">Explore Campus Categories</p>
          </div>
          <h2 className="mt-1.5 text-2xl font-medium sm:text-3xl text-ink truncate">
            Everything your semester requires
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Handed over directly in your college canteen, library, or hostel courtyard.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-deep sm:text-sm transition-colors"
        >
          <span>Browse entire marketplace</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid of Graphic Category Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/marketplace?category=${encodeURIComponent(cat.searchCategory)}`}
              className="group relative flex flex-col justify-between w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-card p-5 transition-all duration-300 hover:border-line-strong hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5"
            >
              {/* Subtle Ambient Background Gradient */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-60 transition-opacity group-hover:opacity-100`}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-card shadow-xs group-hover:scale-105 transition-transform duration-200">
                    <Icon className="h-5 w-5 text-ink" />
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cat.badgeColor}`}
                  >
                    {cat.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-medium text-ink group-hover:text-accent transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
                <span className="font-mono text-faint tabular-nums">
                  {cat.count}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-ink group-hover:text-accent group-hover:translate-x-0.5 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

