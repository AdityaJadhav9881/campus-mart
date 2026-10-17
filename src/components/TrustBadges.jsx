import {
  Banknote,
  GraduationCap,
  MapPin,
  ScanEye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: GraduationCap,
    title: "100% Verified Campus Peers",
    description:
      "All buyers and sellers authenticate with their official Maharashtra CET or institute email. Zero random strangers.",
    highlight: "Student IDs Checked",
  },
  {
    icon: ScanEye,
    title: "4-Angle Vision AI Verification",
    description:
      "Every gadget, calculator, and book undergoes automated 4-angle visual inspection to prevent hidden defects.",
    highlight: "Zero Fake Photos",
  },
  {
    icon: MapPin,
    title: "Hostel & Campus Safe Zones",
    description:
      "Exchange items inside safe college spaces: college library, campus canteen, department lobby, or hostel gates.",
    highlight: "Instant 5-Min Handover",
  },
  {
    icon: Banknote,
    title: "Zero Middleman Fees",
    description:
      "100% of the sale amount stays in the student seller's pocket. No platform cuts, listing charges, or commissions.",
    highlight: "₹0 Commission",
  },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-line bg-sunken/40 py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-accent shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Campus Trust Architecture</span>
          </span>
          <h2 className="mt-3 text-2xl font-medium sm:text-3xl text-ink">
            Engineered exclusively for university safety
          </h2>
          <p className="mt-2 text-xs text-muted sm:text-sm">
            Say goodbye to suspicious classified ads and non-functional gear.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-xs transition-all duration-200 hover:border-line-strong hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-sunken text-accent group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[10.5px] font-medium text-faint">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-medium text-ink leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-line/60 pt-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-positive">
                    <Sparkles className="h-3 w-3" />
                    {pillar.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
