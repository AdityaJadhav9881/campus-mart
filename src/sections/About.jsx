import Reveal from "../components/Reveal.jsx";
import { exchangeFlow } from "../data/features.js";

export default function About() {
  return (
    <section id="project" className="border-t border-hairline bg-abyss">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <Reveal>
            <p className="label-caps text-accent">The Project</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
              Bulletin boards,
              <br />
              replaced.
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-8 text-base leading-relaxed text-muted sm:text-lg">
              Campus exchange has run on cork boards and group chats — informal,
              fragmented, and easy to exploit. CampusMart AI replaces that layer
              with a secure, automated architecture: computer vision captures
              listings, pricing agents keep value fair, and trust agents watch
              every transaction.
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              What remains for students is the part that always mattered —
              finding the right material, at a fair price, from someone on
              campus. The intelligence stays in the background. The exchange
              stays human.
            </p>
          </Reveal>
        </div>

        {/* Signal flow — how an item moves through the architecture */}
        <Reveal delay={160} className="mt-20">
          <div className="border border-hairline bg-surface/60 p-6 sm:p-10">
            <p className="label-caps text-faint">Exchange Flow</p>

            <ol className="mt-8 grid gap-0 md:grid-cols-5">
              {exchangeFlow.map((item, index) => (
                <li
                  key={item.step}
                  className="relative flex flex-col gap-3 border-t border-hairline py-6 md:border-t-0 md:border-l md:py-0 md:pl-6 md:pt-0 md:first:border-l-0 md:first:pl-0"
                >
                  <span className="label-caps text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-semibold tracking-tight text-ink">
                    {item.step}
                  </span>
                  <span className="text-sm leading-relaxed text-muted md:pr-4">
                    {item.caption}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
