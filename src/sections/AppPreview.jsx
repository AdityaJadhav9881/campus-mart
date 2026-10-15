import { useId, useState } from "react";
import { BadgeCheck, Camera, MapPin, Send, ShieldCheck, Zap } from "lucide-react";
import Reveal from "../components/Reveal.jsx";
import ApiStatusBadge from "../components/ApiStatusBadge.jsx";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { feedListings, chatMessages } from "../data/features.js";

const TABS = [
  { id: "feed", label: "Smart Feed", icon: Zap },
  { id: "camera", label: "AI Listing Camera", icon: Camera },
  { id: "chat", label: "Verified Chat", icon: ShieldCheck },
];

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[0.625rem] font-medium text-faint">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="h-1.5 w-1.5 rounded-full bg-faint/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-faint/60" />
      </span>
    </div>
  );
}

function PhoneShell({ title, children }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* Subtle edge light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 bg-[radial-gradient(50%_40%_at_50%_50%,rgba(34,211,238,0.08),transparent_70%)]"
      />

      <div className="relative rounded-[2.5rem] border border-hairline-strong bg-void p-2.5 shadow-[0_0_0_1px_rgba(24,32,44,0.6)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-hairline bg-abyss">
          {/* Notch */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-void"
          />

          <StatusBar />

          <div className="flex items-center justify-between border-b border-hairline px-5 py-2.5">
            <span className="text-[0.5625rem] font-medium tracking-[0.18em] text-accent uppercase">
              {title}
            </span>
            <span className="flex items-center gap-1 text-[0.5625rem] font-medium text-faint">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              VERIFIED
            </span>
          </div>

          <div className="h-[440px] overflow-hidden">{children}</div>

          {/* Home indicator */}
          <div
            aria-hidden="true"
            className="absolute bottom-1.5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-hairline-strong"
          />
        </div>
      </div>
    </div>
  );
}

function mapProductToPhoneItem(product) {
  const price = Number(product.suggested_price ?? product.listed_price ?? 0) || 0;
  const trustRaw = Number(product.seller_trust_score);
  const trust = Number.isFinite(trustRaw)
    ? Math.round(Math.min(100, Math.max(0, trustRaw)))
    : 90;
  return {
    id: `live-${product.id}`,
    title: product.title || "Campus listing",
    price,
    trust,
    tag: (product.category || "CAMPUS").toUpperCase(),
  };
}

function SmartFeed({ items }) {
  return (
    <ul className="px-4 py-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="border-b border-hairline py-3.5 last:border-b-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] font-medium text-ink">
                {item.title}
              </p>
              <p className="mt-1 text-[0.5rem] font-medium tracking-[0.18em] text-faint uppercase">
                {item.tag}
              </p>
            </div>
            <p className="shrink-0 text-[0.8125rem] font-semibold tabular-nums text-accent">
              ₹{item.price}
            </p>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
              <span
                className="h-full rounded-full bg-accent/80"
                style={{ width: `${item.trust}%` }}
              />
            </span>
            <span className="flex items-center gap-1 text-[0.5625rem] font-medium text-muted">
              <BadgeCheck className="h-3 w-3 text-accent" aria-hidden="true" />
              {item.trust} trust
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AiCamera() {
  return (
    <div className="relative h-full">
      {/* Viewfinder scene */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#0b0f16_0%,#070a10_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#18202c_1px,transparent_1px),linear-gradient(to_bottom,#18202c_1px,transparent_1px)] [background-size:28px_28px]"
      />

      {/* Silhouetted object */}
      <div className="absolute left-1/2 top-1/2 h-36 w-24 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-x-0 bottom-0 h-28 rounded-sm border border-hairline-strong bg-surface" />
        <div className="absolute inset-x-2 top-2 h-16 rounded-sm border border-hairline-strong bg-abyss" />
      </div>

      {/* Bounding box + scan */}
      <div className="detect-in absolute left-1/2 top-1/2 h-44 w-32 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 border border-accent/70">
          <span className="absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-accent" />
          <span className="absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-accent" />
          <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-accent" />
          <span className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-accent" />

          <span className="absolute -top-6 left-0 bg-accent px-1.5 py-0.5 text-[0.5rem] font-semibold tracking-wider text-void">
            DRAFTER KIT · 0.94
          </span>

          <span
            aria-hidden="true"
            className="scan-sweep absolute inset-x-0 top-0 h-px bg-accent shadow-[0_0_12px_rgba(34,211,238,0.8)]"
          />
        </div>
      </div>

      {/* Draft listing card */}
      <div className="detect-in absolute inset-x-3 bottom-3 border border-hairline-strong bg-surface/95 p-3 backdrop-blur-sm" style={{ animationDelay: "200ms" }}>
        <p className="text-[0.5rem] font-medium tracking-[0.18em] text-faint uppercase">
          Draft Listing
        </p>
        <p className="mt-1.5 text-[0.8125rem] font-medium text-ink">
          Mini Drafter + Lab Kit
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[0.75rem] font-semibold tabular-nums text-accent">
            Suggested ₹600
          </span>
          <span className="border border-accent/30 bg-accent/[0.06] px-2 py-0.5 text-[0.5625rem] font-medium text-accent">
            Auto-filled
          </span>
        </div>
      </div>
    </div>
  );
}

function VerifiedChat() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-hidden px-4 py-3">
        {chatMessages.map((message) => {
          const mine = message.from === "me";
          return (
            <div
              key={message.id}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              {!mine && (
                <span className="mb-1 flex items-center gap-1 text-[0.5625rem] font-medium text-muted">
                  <BadgeCheck className="h-3 w-3 text-accent" aria-hidden="true" />
                  {message.name}
                </span>
              )}
              <p
                className={`max-w-[85%] px-3 py-2 text-[0.75rem] leading-relaxed ${
                  mine
                    ? "border border-accent/30 bg-accent/[0.07] text-ink"
                    : "border border-hairline bg-surface text-muted"
                }`}
              >
                {message.body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-hairline px-4 py-3">
        <div className="mb-2.5 flex items-center gap-1.5 text-[0.5625rem] font-medium text-muted">
          <MapPin className="h-3 w-3 text-accent" aria-hidden="true" />
          Pickup · Library Atrium — Safe Zone 2
        </div>
        <div className="flex items-center gap-2 border border-hairline-strong bg-surface px-3 py-2">
          <span className="flex-1 text-[0.6875rem] text-faint">
            Message verified student…
          </span>
          <Send className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

const VIEWS = {
  feed: { title: "Smart Feed", Component: SmartFeed },
  camera: { title: "Vision Agent", Component: AiCamera },
  chat: { title: "Secure Chat", Component: VerifiedChat },
};

export default function AppPreview() {
  const groupId = useId();
  const [tab, setTab] = useState("feed");
  const { title, Component } = VIEWS[tab];

  const {
    products: liveProducts,
    online: liveOnline,
    loading: liveLoading,
    refresh: refreshLiveFeed,
  } = useLiveFeed();

  const phoneFeedItems =
    liveProducts.length > 0
      ? liveProducts.slice(0, 4).map(mapProductToPhoneItem)
      : feedListings;

  const viewProps = tab === "feed" ? { items: phoneFeedItems } : {};

  return (
    <section id="preview" className="border-t border-hairline bg-abyss">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="label-caps text-accent">Inside the App</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
                Built for the way
                <br />
                campus actually works.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
                A Flutter app where the feed understands trust, the camera
                builds listings for you, and every conversation stays inside a
                verified campus network. Switch views to walk through it.
              </p>
              <ApiStatusBadge
                online={liveOnline}
                loading={liveLoading}
                onRefresh={refreshLiveFeed}
                className="mt-6"
              />
            </Reveal>

            <Reveal delay={100} className="mt-10">
              <div
                role="tablist"
                aria-label="App screen preview"
                className="flex flex-wrap gap-2"
              >
                {TABS.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === tab;
                  return (
                    <button
                      key={item.id}
                      role="tab"
                      id={`${groupId}-tab-${item.id}`}
                      aria-selected={active}
                      aria-controls={`${groupId}-panel`}
                      tabIndex={active ? 0 : -1}
                      type="button"
                      onClick={() => setTab(item.id)}
                      onKeyDown={(event) => {
                        const index = TABS.findIndex((t) => t.id === tab);
                        if (event.key === "ArrowRight") {
                          setTab(TABS[(index + 1) % TABS.length].id);
                        } else if (event.key === "ArrowLeft") {
                          setTab(
                            TABS[(index - 1 + TABS.length) % TABS.length].id
                          );
                        }
                      }}
                      className={`inline-flex h-11 items-center gap-2 border px-4 text-[0.8125rem] font-medium transition-all duration-200 ${
                        active
                          ? "border-accent/50 bg-accent/[0.07] text-accent"
                          : "border-hairline-strong text-muted hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={160} className="mt-10">
              <ul className="max-w-md border-t border-hairline">
                {[
                  {
                    label: "Smart Feed",
                    text: "Listings ranked by relevance with live seller trust scores on every row.",
                  },
                  {
                    label: "AI Listing Camera",
                    text: "The vision agent frames the item, identifies it, and drafts a priced listing.",
                  },
                  {
                    label: "Verified Student Chat",
                    text: "In-campus pickup negotiation between two verified accounts only.",
                  },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex gap-4 border-b border-hairline py-4"
                  >
                    <span className="label-caps mt-0.5 w-28 shrink-0 text-faint">
                      {row.label}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">
                      {row.text}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <div
              role="tabpanel"
              id={`${groupId}-panel`}
              aria-labelledby={`${groupId}-tab-${tab}`}
            >
              <PhoneShell title={title}>
                <Component {...viewProps} />
              </PhoneShell>
              <p className="mt-5 text-center text-[0.6875rem] text-faint">
                Flutter app — interface preview
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
