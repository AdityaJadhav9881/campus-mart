import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bot,
  Camera,
  CheckCircle2,
  CornerDownLeft,
  Loader2,
  RotateCcw,
  ScanLine,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  User,
} from "lucide-react";
import { usePipeline } from "../hooks/usePipeline.js";
import { useAuth } from "../hooks/useAuth.js";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { askCampusMartAi } from "../api/client.js";
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
    label: "Photo & Category Check",
    icon: ScanLine,
    detail: "Recognises the item and sorts it into the right category.",
  },
  {
    id: 2,
    label: "Campus Market Value",
    icon: TrendingUp,
    detail: "Checks the condition and suggests a fair ₹ price.",
  },
  {
    id: 3,
    label: "Safety Check",
    icon: ShieldCheck,
    detail: "Scans the listing for scammy or unsafe wording.",
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

function AskCampusMartAiSection({ token, catalog, initialQuery = "" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I am CampusMart AI, synced live with our campus marketplace and second-hand student benchmarks in India. Ask me about fair second-hand resale prices, deals under ₹500, or selling tips!",
      source: "catalog",
    },
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  const sampleQuestions = [
    "What is a fair second-hand price for a Bose SoundLink Flex speaker?",
    "Show me the best deals under ₹500",
    "What should I pay for a Casio scientific calculator?",
  ];

  const handleSend = async (questionText) => {
    const text = (questionText ?? input).trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await askCampusMartAi({
        message: text,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        token,
        catalog,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
          source: response.source || "llm",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't reach the server right now. Try checking our live listings on the Marketplace page!",
          source: "catalog",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <section className="mt-8 card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-medium leading-tight">Ask CampusMart AI</h2>
            <p className="mt-0.5 text-xs text-muted">
              Live catalog-aware student assistant for fair second-hand pricing &amp; deals
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-positive/30 bg-positive-soft px-3 py-1 text-xs font-medium text-positive">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
          Live Assistant
        </span>
      </div>

      {/* Suggested chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">Try asking:</span>
        {sampleQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSend(q)}
            className="rounded-full border border-line bg-sunken px-3 py-1 text-xs text-ink transition hover:border-accent hover:bg-card hover:text-accent"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message history */}
      <div className="mt-5 space-y-3.5 max-h-[380px] overflow-y-auto scroll-slim rounded-xl border border-line bg-sunken/40 p-3 sm:p-4">
        {messages.map((m, i) => {
          const isAssistant = m.role === "assistant";
          return (
            <div
              key={i}
              className={`flex gap-3 text-[13.5px] leading-relaxed ${
                isAssistant ? "items-start" : "items-start flex-row-reverse"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                  isAssistant
                    ? "bg-ink text-paper"
                    : "bg-accent text-paper font-semibold"
                }`}
              >
                {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </span>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isAssistant
                    ? "border border-line bg-card text-ink shadow-[0_1px_2px_rgba(28,25,23,0.04)]"
                    : "bg-accent text-paper shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                {isAssistant && m.source && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-faint">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        m.source === "llm" ? "bg-accent" : "bg-positive"
                      }`}
                    />
                    {m.source === "llm"
                      ? "Live Gemini LLM"
                      : "Campus Catalog Benchmark"}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
              <Bot className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              Thinking with campus catalog…
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-4 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type any campus buying or selling question…"
            className="input pr-10"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary h-10 px-4 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}

export default function Sandbox() {
  const { products } = useLiveFeed();
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [initialAiQuery, setInitialAiQuery] = useState("");
  const [ageYears, setAgeYears] = useState(1);
  const [conditionId, setConditionId] = useState("good");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const { step, running, done, run, reset } = usePipeline();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const itemParam = params.get("item") || params.get("title");
      if (itemParam) {
        setTitle(itemParam);
      }
      const queryParam = params.get("query");
      if (queryParam) {
        setInitialAiQuery(queryParam);
      }
    } catch {
      /* ignore */
    }
  }, []);

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
      1: `Sorted into ${evaluate.category}.`,
      2: `About ${rupees(evaluate.suggestedPrice)} · ${Math.round(
        evaluate.confidence * 100
      )}% confidence.`,
      3: evaluate.flagged.length
        ? `Flagged: ${evaluate.flagged.join(", ")}. Clearance: ${evaluate.clearance}.`
        : "Nothing unsafe found. Clearance: CLEARED.",
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
      setError("Add an item name so we have something to estimate.");
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
    <div className="page-in w-full pb-10">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow">Price estimator</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
              Check what your item is worth
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Tell us what you want to sell and we'll suggest a fair campus
              price in seconds. No sign-up needed, and nothing leaves your
              device.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-muted">
            <span
              aria-hidden="true"
              className="live-dot h-1.5 w-1.5 rounded-full bg-positive"
            />
            Free · no sign-up
          </span>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Inputs */}
          <section className="card min-w-0 p-4 sm:p-6">
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
                    Estimate my price
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
              Tip: try words like “cash only” or “off-campus only” in the title
              and watch the safety check flag them.
            </p>
          </section>

          {/* Pipeline + result */}
          <section className="card min-w-0 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="text-[13px] font-medium text-ink">How it works</span>
              <span
                className={`text-[12px] font-medium ${
                  done ? "text-positive" : running ? "text-ink" : "text-faint"
                }`}
              >
                {done ? "Complete" : running ? `Step ${step} of 3` : "Ready when you are"}
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
                  Price estimate ready
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
                  In the app, snap four photos of your item — the same checks
                  give you a final price you can approve, then it goes live for
                  your campus.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-line-strong bg-sunken p-4">
                <p className="text-sm font-medium text-ink-soft">
                  Your result appears here
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Fill in an item on the left and press{" "}
                  <span className="font-medium text-ink">Estimate my price</span>{" "}
                  to see the category, a fair ₹ price and the safety check.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Live AI Assistant */}
        <AskCampusMartAiSection
          token={token}
          catalog={products}
          initialQuery={initialAiQuery}
        />
      </div>
    </div>
  );
}
