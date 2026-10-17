import {
  ArrowRight,
  Camera,
  Check,
  Copy,
  Info,
  ScanEye,
  ShieldCheck,
  Tag,
  Wrench,
} from "lucide-react";
import { Link } from "../router/router.jsx";
import {
  photoAngles,
  readBack,
  verificationSteps,
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
} from "../data/site.js";

const STEP_ICONS = [Camera, ScanEye, Tag, ShieldCheck];

const ANGLE_ICONS = {
  front: Camera,
  back: Copy,
  edges: Wrench,
  wear: ScanEye,
};

const ANGLE_PREVIEWS = {
  front: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
  back: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80",
  edges: "https://images.unsplash.com/photo-1611117765103-68d6f51fba05?auto=format&fit=crop&w=600&q=80",
  wear: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
};

function AngleTile({ angle }) {
  const previewImg = ANGLE_PREVIEWS[angle.id];
  return (
    <li className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-ink/90 p-3 shadow-xs">
      {previewImg && (
        <img
          src={previewImg}
          alt={angle.label}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 pointer-events-none" />

      {/* Reticles */}
      <div className="pointer-events-none absolute left-2.5 top-2.5 h-2.5 w-2.5 border-l-2 border-t-2 border-accent" />
      <div className="pointer-events-none absolute right-2.5 top-2.5 h-2.5 w-2.5 border-r-2 border-t-2 border-accent" />
      <div className="pointer-events-none absolute left-2.5 bottom-2.5 h-2.5 w-2.5 border-l-2 border-b-2 border-accent" />
      <div className="pointer-events-none absolute right-2.5 bottom-2.5 h-2.5 w-2.5 border-r-2 border-b-2 border-accent" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
            {angle.label}
          </span>
        </div>

        <span className="flex items-center gap-1.5 text-[11px] font-medium text-white drop-shadow-sm">
          <Check className="h-3 w-3 shrink-0 text-positive" aria-hidden="true" />
          <span className="truncate">{angle.hint}</span>
        </span>
      </div>
    </li>
  );
}

export default function HowItWorks() {
  return (
    <div className="page-in w-full">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14 lg:py-12">
        {/* Steps */}
        <section className="min-w-0">
          <p className="eyebrow">How verification works</p>

          <h1 className="mt-3 text-3xl font-medium leading-tight sm:mt-4 sm:text-4xl">
            Four photos are all it takes to list something honestly.
          </h1>

          <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-muted sm:mt-4">
            No forms, no guessing what your old gear is worth. Photograph the
            item from four angles and the vision AI does the reading, the
            grading and the pricing.
          </p>

          <ol className="mt-7 space-y-0 border-t border-line">
            {verificationSteps.map((step, index) => {
              const Icon = STEP_ICONS[index];
              return (
                <li
                  key={step.n}
                  className="flex gap-4 border-b border-line py-4 sm:gap-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink-soft">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xs font-semibold tabular-nums text-accent">
                        0{step.n}
                      </span>
                      <h2 className="text-lg leading-snug">{step.title}</h2>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
            <Link to="/sandbox" className="btn btn-primary w-full sm:w-auto">
              Try the price tester
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link to="/marketplace" className="btn btn-secondary w-full sm:w-auto">
              See verified listings
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-card px-4 py-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-muted">
              <span className="font-medium text-ink">Need Help or Campus Support?</span>{" "}
              Our team is one email away — write to{" "}
              <a
                href={SUPPORT_MAILTO}
                className="font-medium text-accent transition-colors hover:text-accent-deep hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and we'll help with verification, listing, or account questions.
            </p>
          </div>
        </section>

        {/* Visual: four angles + what the AI returns */}
        <section className="card min-w-0 p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg leading-none">The four-photo check</h2>
            <span className="text-xs text-faint">Front · back · edges · wear</span>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3">
            {photoAngles.map((angle) => (
              <AngleTile key={angle.id} angle={angle} />
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-line bg-sunken p-4">
            <p className="text-[13px] font-medium text-ink">
              What comes back before you publish
            </p>

            <dl className="mt-3 divide-y divide-line">
              {readBack.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 py-2.5"
                >
                  <dt className="text-[13px] text-muted">{row.label}</dt>
                  <dd className="text-right">
                    <span className="block text-sm font-semibold tabular-nums text-ink">
                      {row.value}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-faint">
                      {row.note}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            Nothing leaves your phone unprocessed — the photos are read for
            condition and value, and the listing is only published once you
            approve the suggested ₹ price.
          </p>
        </section>
      </div>
    </div>
  );
}
