import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Loader2,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Upload,
} from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import { usePipeline } from "../hooks/usePipeline.js";
import {
  categoryBasePrice,
  prohibitedTerms,
  sandboxConditions,
  seedFeedItems,
} from "../data/sandbox.js";

const AGENT_STEPS = [
  {
    id: 1,
    label: "Listing Intelligence Agent",
    tech: "YOLO Vision",
    icon: ScanLine,
    detail: "Classifying item type from image and text.",
  },
  {
    id: 2,
    label: "Price Prediction Agent",
    tech: "Scikit-learn",
    icon: TrendingUp,
    detail: "Scoring condition against campus resale data.",
  },
  {
    id: 3,
    label: "Trust & Fraud Detection Agent",
    tech: "Regex · NLP",
    icon: ShieldCheck,
    detail: "Scanning text and assigning security clearance.",
  },
];

const CONDITION_LABEL = Object.fromEntries(
  sandboxConditions.map((c) => [c.id, c.label])
);

function classifyItem(title) {
  const t = title.toLowerCase();
  const electronics =
    /\b(phone|laptop|tablet|raspberry|arduino|pcb|sensor|camera| charger| battery|monitor|keyboard|mouse|gpu|cpu|headphone|speaker|drone|oscilloscope|multimeter|solder)\b/.test(
      t
    );
  const lab =
    /\b(lab|kit|drafter|microscope|beaker|test tube|probe|breadboard|toolkit|equipment|apparatus|stand|clamp)\b/.test(
      t
    );
  if (electronics) return "Electronics";
  if (lab) return "Lab Equipment";
  return "Academic Material";
}

function scanProhibited(title) {
  const t = title.toLowerCase();
  const flagged = prohibitedTerms.filter((term) => t.includes(term));
  return { flagged, clearance: flagged.length ? "FLAGGED" : "CLEARED" };
}

function priceFor(category, conditionId, ageYears) {
  const base = categoryBasePrice[category] ?? 500;
  const mult =
    sandboxConditions.find((c) => c.id === conditionId)?.multiplier ?? 0.55;
  const age = Number(ageYears) || 0;
  const ageFactor = Math.max(0.55, 1 - age * 0.08);
  const confidence = Math.min(0.97, 0.82 + mult * 0.18 - age * 0.01);
  return {
    suggestedPrice: Math.round(base * mult * ageFactor),
    confidence: Number(confidence.toFixed(2)),
  };
}

function Dropzone({ preview, onFile, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const open = () => inputRef.current?.click();

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <span className="label-caps text-faint">Item Photo</span>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an item photo"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-2 flex cursor-pointer items-center gap-4 border border-dashed p-4 transition-colors duration-200 ${
          dragging
            ? "border-accent/70 bg-accent/[0.06]"
            : "border-hairline-strong bg-surface hover:border-accent/40"
        }`}
      >
        {preview ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-hairline-strong">
            <img
              src={preview}
              alt="Uploaded item preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute inset-0 flex items-center justify-center bg-void/70 text-[0.6rem] font-medium text-ink opacity-0 transition-opacity duration-200 hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-hairline-strong text-faint">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {preview ? "Photo attached" : "Drop a photo or click to browse"}
          </p>
          <p className="mt-0.5 text-xs text-faint">
            JPG or PNG — stays in your browser, never uploaded.
          </p>
        </div>
        {!preview && (
          <Upload
            className="ml-auto h-4 w-4 shrink-0 text-faint"
            aria-hidden="true"
          />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function AgentStepper({ step, running, steps }) {
  return (
    <ol className="mt-2">
      {steps.map((agent) => {
        const Icon = agent.icon;
        const isRunning = running && step === agent.id;
        const isDone = step > agent.id || step === 4;
        const state = isDone ? "done" : isRunning ? "running" : "idle";

        return (
          <li
            key={agent.id}
            className={`flex gap-4 border-t border-hairline py-4 last:border-b ${
              state === "idle" ? "opacity-55" : "opacity-100"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center border transition-colors duration-300 ${
                  isDone
                    ? "border-accent/50 bg-accent/[0.07] text-accent"
                    : isRunning
                      ? "border-accent/60 text-accent"
                      : "border-hairline-strong text-faint"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : isRunning ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              {agent.id < steps.length && (
                <span
                  aria-hidden="true"
                  className={`w-px flex-1 transition-colors duration-300 ${
                    isDone ? "bg-accent/50" : "bg-hairline"
                  }`}
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-ink">
                  {agent.label}
                </span>
                <span className="label-caps text-faint">{agent.tech}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {isDone ? agent.result ?? agent.detail : agent.detail}
              </p>
              {isRunning && (
                <div className="mt-2 h-px w-full bg-hairline">
                  <div
                    className="pipeline-fill h-px bg-accent"
                    style={{ animationDuration: `${agent.duration ?? 900}ms` }}
                  />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function FeedCard({ item, isNew }) {
  const flagged = item.clearance === "FLAGGED";

  return (
    <li
      className={`group relative border-t border-hairline py-5 last:border-b ${
        isNew ? "card-arrive" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-y-100"
      />
      <div
        className={`flex gap-4 transition-all duration-300 ease-out ${
          isNew ? "pl-4" : "group-hover:pl-4"
        }`}
      >
        {item.thumbnail ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden border border-hairline-strong">
            <img
              src={item.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-hairline-strong bg-surface text-[0.5rem] font-medium tracking-[0.14em] text-faint">
            {item.seedTag ?? item.category.slice(0, 4).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {item.title}
              </p>
              <p className="label-caps mt-1 text-faint">
                {item.category} · {item.conditionLabel} · {item.ageYears}y
              </p>
            </div>
            <p className="shrink-0 text-base font-semibold tabular-nums text-accent">
              ₹{item.suggestedPrice.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
              className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[0.6875rem] font-medium ${
                flagged
                  ? "border-amber-300/40 bg-amber-300/[0.06] text-amber-200"
                  : "border-accent/30 bg-accent/[0.06] text-accent"
              }`}
            >
              {flagged ? (
                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              )}
              {item.clearance}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-muted">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Verified student
            </span>

            <span className="text-[0.6875rem] tabular-nums text-faint">
              Confidence {(item.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {flagged && item.flaggedTerms?.length > 0 && (
            <p className="mt-2 text-xs text-amber-200/90">
              Flagged term{item.flaggedTerms.length > 1 ? "s" : ""}:{" "}
              <span className="font-medium">
                {item.flaggedTerms.join(", ")}
              </span>{" "}
              — held for manual trust review.
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export default function LiveSandbox() {
  const [title, setTitle] = useState("");
  const [ageYears, setAgeYears] = useState("1");
  const [conditionId, setConditionId] = useState("good");
  const [preview, setPreview] = useState(null);
  const [feed, setFeed] = useState(seedFeedItems);
  const [newestId, setNewestId] = useState(null);
  const [error, setError] = useState("");

  const { step, running, done, run } = usePipeline();
  const resultsRef = useRef(null);

  const stepsWithResults = useMemo(() => {
    if (!done && step === 0) return AGENT_STEPS;
    const category = classifyItem(title);
    const { flagged, clearance } = scanProhibited(title);
    const { suggestedPrice, confidence } = priceFor(
      category,
      conditionId,
      ageYears
    );
    const results = {
      1: `Classified as ${category}.`,
      2: `Suggested ₹${suggestedPrice.toLocaleString("en-IN")} · ${(
        confidence * 100
      ).toFixed(0)}% confidence.`,
      3: clearance
        ? `${
            flagged.length
              ? `Flagged: ${flagged.join(", ")}.`
              : "No prohibited terms detected."
          } Clearance: ${clearance}.`
        : undefined,
    };
    return AGENT_STEPS.map((a) => ({ ...a, result: results[a.id] }));
  }, [done, step, title, conditionId, ageYears]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    if (!title.trim()) {
      const cleaned = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      if (cleaned) setTitle(cleaned.slice(0, 60));
    }
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const canRun = title.trim().length >= 2 && !running;

  const handleRun = () => {
    if (!title.trim()) {
      setError("Add an item title so the agents have something to read.");
      return;
    }
    setError("");
    setNewestId(null);
    run(() => {
      const category = classifyItem(title);
      const { flagged, clearance } = scanProhibited(title);
      const { suggestedPrice, confidence } = priceFor(
        category,
        conditionId,
        ageYears
      );
      const id = `item-${Date.now()}`;
      setFeed((prev) => [
        {
          id,
          title: title.trim(),
          ageYears: Number(ageYears) || 0,
          condition: conditionId,
          conditionLabel: CONDITION_LABEL[conditionId],
          category,
          suggestedPrice,
          confidence,
          clearance,
          clearanceNote: flagged.length
            ? `Flagged: ${flagged.join(", ")}.`
            : "No prohibited terms detected.",
          flaggedTerms: flagged,
          verified: true,
          thumbnail: preview,
        },
        ...prev,
      ]);
      setNewestId(id);
    });
  };

  const handleReset = () => {
    setTitle("");
    setAgeYears("1");
    setConditionId("good");
    clearFile();
    setError("");
    setNewestId(null);
  };

  return (
    <section id="demo" className="border-t border-hairline bg-abyss">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="lg:grid lg:grid-cols-[20rem_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="label-caps text-accent">Live Sandbox</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                Run the pipeline
                <br />
                yourself.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                A browser-only simulation of the three-agent listing pipeline.
                Add an item, hit run, and watch classification, pricing, and
                fraud clearance happen step by step — then see it land in the
                Campus Feed.
              </p>
              <p className="mt-6 max-w-sm text-xs leading-relaxed text-faint">
                Runs entirely in your browser. No image or text leaves this
                page, and nothing is stored.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 lg:mt-0">
            <Reveal delay={80}>
              <div className="border border-hairline bg-void p-6 sm:p-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                  {/* Form */}
                  <div>
                    <Dropzone
                      preview={preview}
                      onFile={handleFile}
                      onClear={clearFile}
                    />

                    <div className="mt-6">
                      <label htmlFor="sb-title" className="label-caps text-faint">
                        Item Title
                      </label>
                      <input
                        id="sb-title"
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="e.g. Signals & Systems Textbook"
                        className="mt-2 h-12 w-full border border-hairline-strong bg-surface px-4 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none"
                      />
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="sb-age" className="label-caps text-faint">
                          Age (years)
                        </label>
                        <input
                          id="sb-age"
                          type="number"
                          min="0"
                          max="15"
                          value={ageYears}
                          onChange={(e) => setAgeYears(e.target.value)}
                          className="mt-2 h-12 w-full border border-hairline-strong bg-surface px-4 text-sm tabular-nums text-ink focus:border-accent/60 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="label-caps text-faint">Condition</span>
                        <div className="mt-2 grid grid-cols-3 gap-1.5">
                          {sandboxConditions.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              aria-pressed={conditionId === c.id}
                              onClick={() => setConditionId(c.id)}
                              className={`h-12 border text-[0.8125rem] font-medium transition-all duration-200 ${
                                conditionId === c.id
                                  ? "border-accent/50 bg-accent/[0.07] text-accent"
                                  : "border-hairline-strong text-muted hover:text-ink"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className="mt-4 text-xs leading-relaxed text-red-300"
                      >
                        {error}
                      </p>
                    )}

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRun}
                        disabled={!canRun}
                        className="inline-flex h-12 items-center gap-2.5 bg-accent px-6 text-sm font-semibold text-void transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-hairline-strong disabled:text-faint disabled:hover:brightness-100"
                      >
                        {running ? (
                          <>
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                            Running…
                          </>
                        ) : (
                          <>
                            <ScanLine className="h-4 w-4" aria-hidden="true" />
                            Run AI Pipeline
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={running}
                        className="inline-flex h-12 items-center px-4 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink disabled:opacity-40"
                      >
                        Reset
                      </button>
                    </div>

                    <p className="mt-4 text-[0.6875rem] leading-relaxed text-faint">
                      Tip: try a title containing “cash only” or “scam” to see
                      the fraud agent flag it.
                    </p>
                  </div>

                  {/* Stepper */}
                  <div>
                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                      <span className="label-caps text-faint">
                        Agent Pipeline
                      </span>
                      <span
                        className={`label-caps ${
                          done ? "text-accent" : running ? "text-ink" : "text-faint"
                        }`}
                      >
                        {done
                          ? "Complete"
                          : running
                            ? `Step ${step} / 3`
                            : "Idle"}
                      </span>
                    </div>

                    <div
                      ref={resultsRef}
                      aria-live="polite"
                      aria-atomic="true"
                      className="sr-only"
                    >
                      {done && "Pipeline complete. Listing added to Campus Feed."}
                    </div>

                    <AgentStepper
                      step={step}
                      running={running}
                      steps={stepsWithResults}
                    />

                    {done && (
                      <div className="detect-in mt-4 border border-accent/30 bg-accent/[0.06] p-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-accent">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Verified and published to Campus Feed
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted">
                          Your listing now appears below with its AI price,
                          trust badge, and security clearance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Campus Feed */}
            <Reveal delay={120} className="mt-10">
              <div className="flex items-baseline justify-between border-b border-hairline pb-3">
                <h3 className="text-sm font-medium tracking-tight text-ink">
                  Campus Feed
                </h3>
                <span className="label-caps text-faint">
                  {feed.length} listings
                </span>
              </div>

              <ul>
                {feed.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    isNew={item.id === newestId}
                  />
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
