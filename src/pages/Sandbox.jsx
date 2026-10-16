import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Upload,
} from "lucide-react";
import { usePipeline } from "../hooks/usePipeline.js";
import { sandboxConditions } from "../data/sandbox.js";
import {
  classifyItem,
  priceFor,
  scanProhibited,
} from "../lib/listingEngine.js";
import { rupees } from "../lib/format.js";

const AGENT_STEPS = [
  {
    id: 1,
    label: "Listing agent",
    tech: "Vision · YOLO",
    icon: ScanLine,
    detail: "Reads the item and assigns a category.",
  },
  {
    id: 2,
    label: "Price agent",
    tech: "Regression · campus data",
    icon: TrendingUp,
    detail: "Grades condition and suggests a ₹ resale price.",
  },
  {
    id: 3,
    label: "Trust agent",
    tech: "Regex · NLP",
    icon: ShieldCheck,
    detail: "Scans the listing text for scam signals.",
  },
];

const CONDITION_LABEL = Object.fromEntries(
  sandboxConditions.map((c) => [c.id, c.label])
);

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
      <span className="text-[13px] font-medium text-ink">Item photo (optional)</span>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an item photo"
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 transition-colors duration-150 ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line-strong bg-sunken hover:border-accent/50"
        }`}
      >
        {preview ? (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line">
            <img
              src={preview}
              alt="Uploaded item preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink/70 text-[10px] font-medium text-paper opacity-0 transition-opacity duration-150 hover:opacity-100"
            >
              Remove
            </button>
          </span>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-faint">
            <Camera className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        )}

        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">
            {preview ? "Photo attached" : "Drop a photo or click to browse"}
          </span>
          <span className="mt-0.5 block text-xs text-faint">
            Stays in your browser — never uploaded.
          </span>
        </span>

        {!preview && (
          <Upload className="ml-auto h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function Stepper({ step, running, steps }) {
  return (
    <ol>
      {steps.map((agent) => {
        const Icon = agent.icon;
        const isRunning = running && step === agent.id;
        const isDone = step > agent.id || step === 4;
        const state = isDone ? "done" : isRunning ? "running" : "idle";

        return (
          <li
            key={agent.id}
            className={`flex gap-4 border-b border-line py-4 first:border-t ${
              state === "idle" ? "opacity-60" : "opacity-100"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${
                  isDone
                    ? "border-positive/30 bg-positive-soft text-positive"
                    : isRunning
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-line bg-card text-faint"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              {agent.id < steps.length && (
                <span
                  aria-hidden="true"
                  className={`w-px flex-1 transition-colors duration-300 ${
                    isDone ? "bg-positive/40" : "bg-line"
                  }`}
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-sm font-medium text-ink">{agent.label}</span>
                <span className="text-[11px] text-faint">{agent.tech}</span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {isDone && agent.result ? agent.result : agent.detail}
              </p>
              {isRunning && (
                <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="pipeline-fill h-0.5 rounded-full bg-accent"
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

export default function Sandbox() {
  const [title, setTitle] = useState("");
  const [ageYears, setAgeYears] = useState(1);
  const [conditionId, setConditionId] = useState("good");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const { step, running, done, run, reset } = usePipeline();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const evaluate = useMemo(() => {
    const category = classifyItem(title);
    const { flagged, clearance } = scanProhibited(title);
    const { suggestedPrice, confidence } = priceFor(
      category,
      conditionId,
      ageYears
    );
    return { category, flagged, clearance, suggestedPrice, confidence };
  }, [title, conditionId, ageYears]);

  const stepsWithResults = useMemo(() => {
    if (!done && step === 0) return AGENT_STEPS;
    const results = {
      1: `Classified as ${evaluate.category}.`,
      2: `Suggested ${rupees(evaluate.suggestedPrice)} · ${Math.round(
        evaluate.confidence * 100
      )}% confidence.`,
      3: evaluate.flagged.length
        ? `Flagged: ${evaluate.flagged.join(", ")}. Clearance: ${evaluate.clearance}.`
        : "No prohibited terms. Clearance: CLEARED.",
    };
    return AGENT_STEPS.map((agent) => ({ ...agent, result: results[agent.id] }));
  }, [done, step, evaluate]);

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
    if (title.trim().length < 2) {
      setError("Add an item title so the agents have something to read.");
      return;
    }
    setError("");
    setResult(null);
    run(() => {
      setResult({ ...evaluate, title: title.trim(), conditionId, ageYears });
    });
  };

  const handleReset = () => {
    reset();
    setTitle("");
    setAgeYears(1);
    setConditionId("good");
    clearFile();
    setError("");
    setResult(null);
  };

  return (
    <div className="page-in h-full overflow-y-auto scroll-slim">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow">Interactive sandbox</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
              Run the AI pipeline yourself
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Describe an item the way you would in the app. The three agents
              classify it, price it in ₹ and check it for scam signals — no
              account, no upload, nothing stored.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-muted">
            <span
              aria-hidden="true"
              className="live-dot h-1.5 w-1.5 rounded-full bg-positive"
            />
            Runs in your browser
          </span>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Inputs */}
          <section className="card p-5 sm:p-6">
            <Dropzone preview={preview} onFile={handleFile} onClear={clearFile} />

            <div className="mt-5">
              <label htmlFor="sb-title" className="text-[13px] font-medium text-ink">
                What are you selling?
              </label>
              <input
                id="sb-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Signals & Systems textbook, 3rd edition"
                className="input mt-2"
              />
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="sb-age" className="text-[13px] font-medium text-ink">
                  How old is it?
                </label>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {ageYears} {ageYears === 1 ? "year" : "years"}
                </span>
              </div>
              <input
                id="sb-age"
                type="range"
                min={0}
                max={10}
                step={1}
                value={ageYears}
                onChange={(event) => setAgeYears(Number(event.target.value))}
                className="range-track mt-2"
                aria-valuetext={`${ageYears} years`}
              />
              <div className="flex justify-between text-[11px] tabular-nums text-faint">
                <span>Brand new</span>
                <span>10 years</span>
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="text-[13px] font-medium text-ink">Condition</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {sandboxConditions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={conditionId === item.id}
                    onClick={() => setConditionId(item.id)}
                    className={`h-11 rounded-xl border text-[13px] font-medium transition-colors duration-150 ${
                      conditionId === item.id
                        ? "border-ink bg-ink text-paper"
                        : "border-line-strong bg-card text-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="mt-4 text-[13px] text-warn">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRun}
                disabled={!canRun}
                className="btn btn-primary"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Running…
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" aria-hidden="true" />
                    Run AI pipeline
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={running}
                className="btn btn-ghost"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-faint">
              Tip: add “cash only” or “off-campus only” to the title and watch
              the trust agent flag it.
            </p>
          </section>

          {/* Pipeline + result */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="text-[13px] font-medium text-ink">Agent pipeline</span>
              <span
                className={`text-[12px] font-medium ${
                  done ? "text-positive" : running ? "text-ink" : "text-faint"
                }`}
              >
                {done ? "Complete" : running ? `Step ${step} of 3` : "Idle"}
              </span>
            </div>

            <div aria-live="polite" className="sr-only">
              {done && "Pipeline complete."}
            </div>

            <Stepper step={step} running={running} steps={stepsWithResults} />

            {done && result ? (
              <div className="mt-5 rounded-xl border border-positive/25 bg-positive-soft p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-positive">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Draft listing ready
                </p>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">
                      {result.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {result.category} · {CONDITION_LABEL[result.conditionId]} ·{" "}
                      {result.ageYears}y old
                    </p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums leading-none text-ink">
                    {rupees(result.suggestedPrice)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] font-medium text-muted">
                    <BadgeCheck className="h-3 w-3 text-positive" aria-hidden="true" />
                    {Math.round(result.confidence * 100)}% confidence
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      result.clearance === "FLAGGED"
                        ? "border-warn/30 bg-warn-soft text-warn"
                        : "border-line bg-card text-muted"
                    }`}
                  >
                    {result.clearance === "FLAGGED" ? (
                      <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 text-positive" aria-hidden="true" />
                    )}
                    {result.clearance}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] font-medium text-muted">
                    <Camera className="h-3 w-3" aria-hidden="true" />
                    {preview ? "1 photo attached" : "Add 4 photos in the app"}
                  </span>
                </div>

                <p className="mt-3 text-[12px] leading-relaxed text-muted">
                  In the app the same three checks run over your four photos —
                  you approve the price, then it goes live for your campus.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-line-strong bg-sunken p-4">
                <p className="text-sm font-medium text-ink-soft">
                  Your result appears here
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Fill in an item on the left and press{" "}
                  <span className="font-medium text-ink">Run AI pipeline</span> to
                  see the category, the suggested ₹ price and the security
                  clearance.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
