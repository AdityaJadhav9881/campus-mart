import { ArrowDown, Download } from "lucide-react";
import { agentPipeline } from "../data/features.js";

export default function Hero({ onDownload }) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Controlled ambient light — depth, not decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_55%_at_50%_0%,rgba(34,211,238,0.09),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-[0.14] [background-image:linear-gradient(to_right,#18202c_1px,transparent_1px),linear-gradient(to_bottom,#18202c_1px,transparent_1px)] [background-size:88px_88px] [-webkit-mask-image:radial-gradient(55%_50%_at_50%_10%,black,transparent)] [mask-image:radial-gradient(55%_50%_at_50%_10%,black,transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-36 md:pb-32 md:pt-44">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p
              className="hero-in label-caps text-accent"
              style={{ animationDelay: "60ms" }}
            >
              Multi-Agent AI Marketplace
            </p>

            <h1
              className="hero-in mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "160ms" }}
            >
              CampusMart AI:
              <br />
              The Smart Campus{" "}
              <span className="text-accent">Marketplace</span>
            </h1>

            <p
              className="hero-in mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
              style={{ animationDelay: "280ms" }}
            >
              A secure, AI-driven exchange for college students. Buy, sell, and
              trade academic materials with intelligent listings, fair pricing,
              and trust built into every transaction.
            </p>

            <div
              className="hero-in mt-10 flex flex-wrap items-center gap-6"
              style={{ animationDelay: "400ms" }}
            >
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex h-12 items-center gap-2.5 bg-accent px-7 text-sm font-semibold text-void transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download App
              </button>
              <a
                href="#features"
                className="group inline-flex h-12 items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink"
              >
                Explore the intelligence
                <ArrowDown
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* Agent mesh — the product's architecture, made visible */}
          <div
            className="hero-in hidden lg:block"
            style={{ animationDelay: "480ms" }}
            aria-hidden="true"
          >
            <div className="border border-hairline bg-abyss/70 p-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <span className="label-caps text-faint">Agent Mesh</span>
                <span className="label-caps text-faint">04 Agents</span>
              </div>

              <ul className="mt-2">
                {agentPipeline.map((agent) => (
                  <li
                    key={agent.label}
                    className="flex items-center gap-3 border-b border-hairline py-3.5 last:border-b-0"
                  >
                    <span className="agent-dot h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-sm text-ink/90">{agent.label}</span>
                    <span className="label-caps ml-auto text-faint">
                      {agent.role}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center py-4">
                <ArrowDown className="h-4 w-4 text-faint" />
              </div>

              <div className="border border-hairline-strong bg-surface px-4 py-3.5 text-center text-sm font-medium text-ink">
                CampusMart Core
              </div>

              <div className="flex justify-center py-4">
                <ArrowDown className="h-4 w-4 text-faint" />
              </div>

              <div className="border border-accent/30 bg-accent/[0.06] px-4 py-3.5 text-center text-sm font-medium text-accent">
                Verified Exchange
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
