import { useId, useMemo, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { priceCategories, conditionTiers } from "../data/features.js";

export default function PriceEstimator() {
  const groupId = useId();
  const [categoryId, setCategoryId] = useState(priceCategories[0].id);
  const [conditionId, setConditionId] = useState(conditionTiers[0].id);
  const [maxPrice, setMaxPrice] = useState(priceCategories[0].max);

  const category =
    priceCategories.find((c) => c.id === categoryId) ?? priceCategories[0];
  const condition =
    conditionTiers.find((c) => c.id === conditionId) ?? conditionTiers[0];

  const suggested = useMemo(
    () => Math.round(maxPrice * condition.multiplier),
    [maxPrice, condition]
  );
  const discount = useMemo(
    () => Math.round((1 - condition.multiplier) * 100),
    [condition]
  );

  const handleCategory = (next) => {
    setCategoryId(next.id);
    setMaxPrice(Math.round(next.max * 0.6));
  };

  const currency = (value) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <section id="estimator" className="border-t border-hairline bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="lg:grid lg:grid-cols-[20rem_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="label-caps text-accent">Interactive Demo</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                See the pricing
                <br />
                agent think.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                Pick a category, set what you paid, and choose the item's
                condition. The suggested resale price, selling speed, and
                discount update live — the same signals the in-app agent uses.
              </p>
            </Reveal>
          </div>

          <Reveal delay={80} className="mt-14 lg:mt-0">
            <div className="border border-hairline bg-abyss/60 p-6 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
                {/* Inputs */}
                <div>
                  <fieldset>
                    <legend className="label-caps text-faint">
                      Category
                    </legend>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {priceCategories.map((item) => {
                        const active = item.id === categoryId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => handleCategory(item)}
                            className={`h-10 border px-4 text-[0.8125rem] font-medium transition-all duration-200 ${
                              active
                                ? "border-accent/50 bg-accent/[0.07] text-accent"
                                : "border-hairline-strong text-muted hover:border-hairline-strong hover:text-ink"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-10">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor={`${groupId}-price`}
                        className="label-caps text-faint"
                      >
                        Original Price
                      </label>
                      <span className="text-sm font-semibold tabular-nums text-ink">
                        {currency(maxPrice)}
                      </span>
                    </div>
                    <input
                      id={`${groupId}-price`}
                      type="range"
                      min={50}
                      max={category.max}
                      step={10}
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(Number(event.target.value))}
                      className="range-track mt-2"
                      aria-valuetext={currency(maxPrice)}
                    />
                    <div className="flex justify-between text-[0.6875rem] tabular-nums text-faint">
                      <span>{currency(50)}</span>
                      <span>{currency(category.max)}</span>
                    </div>
                  </div>

                  <fieldset className="mt-10">
                    <legend className="label-caps text-faint">Condition</legend>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {conditionTiers.map((item) => {
                        const active = item.id === conditionId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setConditionId(item.id)}
                            className={`h-12 border text-[0.8125rem] font-medium transition-all duration-200 ${
                              active
                                ? "border-accent/50 bg-accent/[0.07] text-accent"
                                : "border-hairline-strong text-muted hover:text-ink"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>

                {/* Output */}
                <div
                  className="relative border border-hairline-strong bg-surface p-6 sm:p-7"
                  aria-live="polite"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
                  />

                  <p className="label-caps text-faint">AI Suggested Resale</p>
                  <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-ink sm:text-5xl">
                    {currency(suggested)}
                  </p>

                  <span className="mt-4 inline-flex h-7 items-center border border-accent/30 bg-accent/[0.06] px-3 text-[0.6875rem] font-medium tracking-[0.12em] text-accent uppercase">
                    {discount}% below retail
                  </span>

                  <dl className="mt-8 space-y-0 border-t border-hairline">
                    <div className="flex items-center justify-between border-b border-hairline py-4">
                      <dt className="text-sm text-muted">
                        Estimated Selling Speed
                      </dt>
                      <dd className="text-sm font-medium text-ink">
                        {condition.speed}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-hairline py-4">
                      <dt className="text-sm text-muted">Condition factor</dt>
                      <dd className="text-sm font-medium tabular-nums text-ink">
                        ×{condition.multiplier.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <dt className="text-sm text-muted">Category</dt>
                      <dd className="text-sm font-medium text-ink">
                        {category.label}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-6 text-[0.6875rem] leading-relaxed text-faint">
                    Illustrative model. The live pricing agent also weighs
                    campus demand, edition cycles, and recent exchange history.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
