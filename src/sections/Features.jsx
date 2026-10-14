import Reveal from "../components/Reveal.jsx";
import { features } from "../data/features.js";

export default function Features() {
  return (
    <section id="features" className="border-t border-hairline bg-void">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="lg:grid lg:grid-cols-[20rem_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="label-caps text-accent">Intelligence Layer</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                Four agents.
                <br />
                One marketplace.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                Each capability is an agent with a single responsibility —
                working together so students never touch a manual form, a
                guessing game, or a scam.
              </p>
            </Reveal>
          </div>

          <ul className="mt-14 lg:mt-0">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal
                  as="li"
                  key={feature.id}
                  delay={index * 80}
                  className="group relative border-t border-hairline last:border-b"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-y-100"
                  />
                  <div className="flex gap-5 py-8 pl-0 transition-all duration-300 ease-out group-hover:pl-6 sm:gap-7 sm:py-10">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-faint transition-colors duration-200 group-hover:text-accent">
                        {feature.index}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center border border-hairline-strong text-muted transition-colors duration-200 group-hover:border-accent/40 group-hover:text-accent">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-accent/90">
                        {feature.summary}
                      </p>
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                        {feature.body}
                      </p>
                      <p className="label-caps mt-6 text-faint">
                        Connects to — {feature.connectsTo}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
