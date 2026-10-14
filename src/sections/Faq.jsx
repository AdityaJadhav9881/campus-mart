import { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import { faqs } from "../data/features.js";

export default function Faq() {
  const [openId, setOpenId] = useState(faqs[0].id);

  return (
    <section id="faq" className="border-t border-hairline bg-void">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="lg:grid lg:grid-cols-[20rem_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="label-caps text-accent">Questions</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                Before you
                <br />
                download.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                The concerns every student raises about a campus marketplace —
                answered directly.
              </p>
            </Reveal>
          </div>

          <Reveal delay={80} className="mt-14 lg:mt-0">
            <ul>
              {faqs.map((faq) => {
                const open = faq.id === openId;
                return (
                  <li
                    key={faq.id}
                    className="group border-t border-hairline last:border-b"
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`faq-panel-${faq.id}`}
                        id={`faq-button-${faq.id}`}
                        onClick={() => setOpenId(open ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-6 py-6 text-left"
                      >
                        <span
                          className={`text-base font-medium tracking-tight transition-colors duration-200 sm:text-lg ${
                            open ? "text-ink" : "text-muted group-hover:text-ink"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-all duration-300 ${
                            open
                              ? "rotate-45 border-accent/50 text-accent"
                              : "border-hairline-strong text-faint group-hover:text-ink"
                          }`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </button>
                    </h3>

                    <div
                      id={`faq-panel-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-button-${faq.id}`}
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{
                        gridTemplateRows: open ? "1fr" : "0fr",
                      }}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={`max-w-2xl pb-8 pr-10 text-sm leading-relaxed text-muted transition-opacity duration-200 ${
                            open ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
