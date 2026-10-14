import { Download } from "lucide-react";
import Reveal from "../components/Reveal.jsx";

export default function Footer({ onDownload }) {
  return (
    <footer id="download" className="border-t border-hairline bg-void">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="border-b border-hairline py-24 md:py-32">
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-caps text-accent">Get the App</p>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                Your campus exchange,
                <br />
                intelligently connected.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
                CampusMart AI is a mobile-first marketplace. Download the app
                to list with your camera, price with confidence, and trade
                inside a verified campus network.
              </p>
            </div>

            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-12 shrink-0 items-center gap-2.5 bg-accent px-7 text-sm font-semibold text-void transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download App
            </button>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-caps text-ink">
              Campusmart
              <span className="ml-1 align-super text-[0.55rem] font-semibold text-accent">
                AI
              </span>
            </p>
            <p className="mt-2 text-xs text-faint">
              Multi-agent marketplace for academic exchange.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <p className="text-sm text-muted">
              Engineered by{" "}
              <span className="font-medium text-ink">Aditya Jadhav</span>{" "}
              <span className="text-faint">|</span>{" "}
              <span className="font-medium text-accent">Infinity Crew</span>
            </p>
            <p className="text-xs text-faint">&copy; 2026 CampusMart AI</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
