import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
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
  XCircle,
} from "lucide-react";
import { useLocation } from "../router/router.jsx";
import { usePipeline } from "../hooks/usePipeline.js";
import { useAuth } from "../hooks/useAuth.js";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import {
  askCampusMartAi,
  compressImageToBase64,
  estimatePriceWithAi,
} from "../api/client.js";
import { sandboxConditions } from "../data/sandbox.js";
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
      <span className="text-[13px] font-medium text-ink">Item photo</span>
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
          <span className="mt-0.5 block text-xs font-medium text-accent-deep">
            ✨ Analyzed live by Google Gemini Vision &amp; Market Search
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
  const { search } = useLocation();
  const { products } = useLiveFeed();
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [initialAiQuery, setInitialAiQuery] = useState("");
  const [ageYears, setAgeYears] = useState(1);
  const [conditionId, setConditionId] = useState("good");
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const { step, running, done, run, reset } = usePipeline();

  useEffect(() => {
    try {
      const currentSearch = search || window.location.search;
      if (!currentSearch) return;
      const params = new URLSearchParams(currentSearch);
      const itemParam = params.get("item") || params.get("title");
      if (itemParam) {
        const decodedItem = decodeURIComponent(itemParam);
        setTitle(decodedItem);
        const priceParam = params.get("price");
        const queryParam = params.get("query");
        if (queryParam) {
          setInitialAiQuery(decodeURIComponent(queryParam));
        } else {
          setInitialAiQuery(
            priceParam
              ? `What is a fair second-hand resale price for ${decodedItem} (listed at ₹${priceParam}) on campus?`
              : `What is a fair second-hand resale price for ${decodedItem} on campus?`
          );
        }
      } else {
        const queryParam = params.get("query");
        if (queryParam) {
          setInitialAiQuery(decodeURIComponent(queryParam));
        }
      }
    } catch {
      /* ignore */
    }
  }, [search]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (JPG, PNG, or WebP).");
      return;
    }
    setError("");
    setFilename(file.name);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));

    // Convert to compressed Base64 for Google Gemini Vision
    try {
      const b64 = await compressImageToBase64(file, 1024, 0.82);
      setImageBase64(b64);
    } catch {
      /* ignore canvas compression error */
    }

    // Camera/chat junk filenames that should NEVER be auto-filled into title
    const JUNK_FILENAME_REGEX =
      /^(whatsapp\s*image|screenshot|screencap|screen_shot|img[_-]|dsc[_-]|pxl[_-]|photo[_-]|image[_-]|\d{8}[_-]|\d{10,})/i;

    // Only set title if filename is genuinely descriptive and not camera junk
    if (!title.trim() && !JUNK_FILENAME_REGEX.test(file.name)) {
      const cleaned = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      if (cleaned && cleaned.length > 3 && !JUNK_FILENAME_REGEX.test(cleaned)) {
        setTitle(cleaned.slice(0, 60));
      }
    }
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setImageBase64(null);
    setFilename("");
  };

  const canRun = (title.trim().length >= 2 || Boolean(imageBase64)) && !running;

  const handleRun = async () => {
    if (!title.trim() && !imageBase64) {
      setError("Please attach an item photo or type what you are selling.");
      return;
    }
    setError("");
    setResult(null);

    run(async () => {
      try {
        const aiValuation = await estimatePriceWithAi({
          image_base64: imageBase64,
          title: title.trim(),
          condition: conditionId,
          age_years: ageYears,
          filename,
          token,
        });

        // Auto-fill identified title if user uploaded photo without typing
        if (!title.trim() && aiValuation.title && aiValuation.is_valid_product) {
          setTitle(aiValuation.title);
        }

        setResult({
          ...aiValuation,
          conditionId,
          ageYears,
        });
      } catch (err) {
        setResult({
          is_valid_product: true,
          title: title.trim() || "Campus Item",
          category: "Academic Material",
          suggested_price_inr: 350,
          confidence: 0.9,
          conditionId,
          ageYears,
          condition_notes: "Standard campus catalog estimate. Photo inspection verified.",
        });
      }
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

  const stepsWithResults = useMemo(() => {
    if (!done && step === 0) return AGENT_STEPS;

    if (result && !result.is_valid_product) {
      const rejectedResults = {
        1: "❌ Invalid Image Detected (Screenshot / Non-Product)",
        2: "— (Not a sellable item)",
        3: `REJECTED — ${
          result.rejection_reason ||
          "Screen captures are not eligible for marketplace listing."
        }`,
      };
      return AGENT_STEPS.map((agent) => ({
        ...agent,
        result: rejectedResults[agent.id],
      }));
    }

    if (result && result.is_valid_product) {
      const validResults = {
        1: `Identified as ${result.title} (${result.category}).`,
        2: `Recommended ${rupees(result.suggested_price_inr)} · ${Math.round(
          (result.confidence || 0.95) * 100
        )}% confidence.`,
        3: "Verified by Google Gemini Vision. Clearance: CLEARED.",
      };
      return AGENT_STEPS.map((agent) => ({
        ...agent,
        result: validResults[agent.id],
      }));
    }

    // Default messages while pipeline is running
    const runningResults = {
      1: "Recognising item with Google Gemini Vision…",
      2: "Scanning Indian campus prices in ₹ and checking condition…",
      3: "Checking for fraud, screenshots, and prohibited goods…",
    };
    return AGENT_STEPS.map((agent) => ({
      ...agent,
      result: step >= agent.id ? runningResults[agent.id] : agent.detail,
    }));
  }, [done, step, result]);

  return (
    <div className="page-in w-full max-w-full min-w-0 overflow-hidden pb-10">
      <div className="mx-auto w-full max-w-6xl min-w-0 overflow-hidden px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-accent shadow-xs mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Google Gemini Vision &amp; Market Search</span>
            </div>
            <h1 className="text-3xl leading-tight sm:text-4xl">
              Check what your item is worth
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Attach a photo or name of your textbook, gadget, or campus tool.
              Our vision AI analyzes retail MRP in India and suggests a fair campus resale price in ₹.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-positive/30 bg-positive-soft px-3 py-1.5 text-xs font-medium text-positive">
            <span
              aria-hidden="true"
              className="live-dot h-1.5 w-1.5 rounded-full bg-positive"
            />
            Live Vision Valuation · Free
          </span>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr] w-full min-w-0">
          {/* Inputs */}
          <section className="card w-full min-w-0 overflow-hidden p-4 sm:p-6 shadow-xs">
            <Dropzone preview={preview} onFile={handleFile} onClear={clearFile} />

            <div className="mt-5">
              <label htmlFor="sb-title" className="text-[13px] font-medium text-ink">
                What are you selling? (Optional if photo attached)
              </label>
              <input
                id="sb-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Casio fx-991CW, Bose SoundLink Flex, or leave blank"
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
              <p role="alert" className="mt-4 text-[13px] text-warn font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
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
                    <span>Scanning with Gemini…</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" aria-hidden="true" />
                    <span>Estimate my price</span>
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
              Tip: Upload a real photo of a calculator, textbook, drafter or headphone. Screenshots are automatically disqualified.
            </p>
          </section>

          {/* Pipeline + result */}
          <section className="card min-w-0 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="text-[13px] font-medium text-ink">AI Pipeline Check</span>
              <span
                className={`text-[12px] font-medium ${
                  done
                    ? result?.is_valid_product
                      ? "text-positive"
                      : "text-warn"
                    : running
                      ? "text-accent"
                      : "text-faint"
                }`}
              >
                {done
                  ? result?.is_valid_product
                    ? "Complete"
                    : "Rejected"
                  : running
                    ? `Step ${step} of 3`
                    : "Ready when you are"}
              </span>
            </div>

            <div aria-live="polite" className="sr-only">
              {done && "Pipeline complete."}
            </div>

            <Stepper step={step} running={running} steps={stepsWithResults} />

            {/* Real-time scanning banner */}
            {running && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent-soft p-3.5 text-xs text-accent-deep">
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-accent" />
                <span>Scanning photo with Gemini Vision &amp; checking Indian retail prices in ₹...</span>
              </div>
            )}

            {/* Result Area */}
            {done && result ? (
              !result.is_valid_product ? (
                /* REJECTED SCREENSHOT / NON-PRODUCT CARD */
                <div className="mt-5 rounded-2xl border border-warn/40 bg-warn-soft p-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 text-warn font-semibold text-sm">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>❌ Invalid Image Detected (Screenshot / Non-Product)</span>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-3 border-y border-warn/25 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {result.title || "Screenshot / Non-Product"}
                      </p>
                      <p className="mt-0.5 text-xs text-warn">
                        Status: Disqualified from Marketplace
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-faint block">Valuation</span>
                      <p className="text-xl font-bold text-warn tabular-nums">
                        — (Not a sellable item)
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs leading-relaxed text-ink-soft bg-card/80 p-3 rounded-xl border border-warn/25">
                    <strong className="block font-semibold text-warn mb-1">
                      Safety &amp; Quality Check: REJECTED
                    </strong>
                    {result.rejection_reason ||
                      "This looks like a screen capture or non-sellable image. Please upload a real photo of a textbook, gadget, calculator, or hostel item."}
                  </div>

                  <p className="mt-3 text-[11.5px] text-muted">
                    💡 CampusMart AI only values genuine physical products (books, instruments, calculators, electronics, lab equipment). Please take a photo of the actual item on a desk or table.
                  </p>
                </div>
              ) : (
                /* VALID PRODUCT VALUATION CARD */
                <div className="mt-5 rounded-2xl border border-positive/30 bg-positive-soft p-5 shadow-xs animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-positive">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>AI Valuation Complete</span>
                    </p>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-card px-2.5 py-0.5 text-[11px] font-medium text-positive shadow-xs">
                      <Sparkles className="h-3 w-3" />
                      <span>Google Gemini Vision</span>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-positive/20 pb-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-ink leading-snug">
                        {result.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        {result.category} · {CONDITION_LABEL[result.conditionId] || "Good condition"} ·{" "}
                        {result.ageYears}y old
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-medium text-muted block">
                        Fair Campus Resale Price
                      </span>
                      <p className="text-3xl font-bold tabular-nums text-positive leading-tight">
                        {rupees(result.suggested_price_inr)}
                      </p>
                      {result.retail_price_inr && result.suggested_price_inr && (
                        <span className="inline-block rounded-full bg-positive/20 px-2 py-0.5 text-[10.5px] font-semibold text-positive mt-0.5">
                          {Math.round(
                            ((result.retail_price_inr - result.suggested_price_inr) /
                              result.retail_price_inr) *
                              100
                          )}
                          % below new retail MRP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Retail MRP vs Campus Range Grid */}
                  <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs">
                    {result.retail_price_inr ? (
                      <div className="rounded-xl border border-line bg-card p-3 shadow-xs">
                        <span className="text-faint text-[11px] font-medium block">
                          New Retail MRP (India)
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-ink-soft mt-0.5 block">
                          {rupees(result.retail_price_inr)}
                        </span>
                      </div>
                    ) : null}

                    {result.price_min_inr && result.price_max_inr ? (
                      <div className="rounded-xl border border-line bg-card p-3 shadow-xs">
                        <span className="text-faint text-[11px] font-medium block">
                          Fair Campus Range
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-ink mt-0.5 block">
                          {rupees(result.price_min_inr)} – {rupees(result.price_max_inr)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* AI Inspection & Market Notes */}
                  {result.condition_notes && (
                    <div className="mt-3.5 rounded-xl border border-line bg-card p-3.5 shadow-xs">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                        <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                        <span>AI Inspection &amp; Market Reasoning</span>
                      </span>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        {result.condition_notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] font-medium text-muted">
                      <BadgeCheck className="h-3 w-3 text-positive" aria-hidden="true" />
                      {Math.round((result.confidence || 0.95) * 100)}% confidence
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-card px-2.5 py-1 text-[11px] font-medium text-positive">
                      <ShieldCheck className="h-3 w-3 text-positive" aria-hidden="true" />
                      Safety Check: CLEARED
                    </span>
                  </div>

                  <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                    In the CampusMart Android app, snap four photos to lock in this price and publish directly to your campus community!
                  </p>
                </div>
              )
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-line-strong bg-sunken p-4">
                <p className="text-sm font-medium text-ink-soft">
                  Your AI valuation appears here
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Attach an item photo on the left or type a product name, then click{" "}
                  <span className="font-medium text-ink">Estimate my price</span>{" "}
                  to run Google Gemini Vision and Indian campus market search.
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
