import { useState } from "react";
import { GraduationCap, ImageOff, Star } from "lucide-react";
import { useNavigate } from "../router/router.jsx";
import {
  buildWhatsAppShareUrl,
  conditionLabel,
  inferAcademicMeta,
  productPrice,
  relativeTime,
  rupees,
  trustOutOf5,
} from "../lib/format.js";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.301-.15-1.781-.878-2.057-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.952 1.178-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.3-.501.101-.2.051-.376-.025-.527-.075-.15-.677-1.63-.928-2.232-.245-.587-.494-.508-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.527.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.229 3.11c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.781-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.076-.126-.276-.201-.577-.352zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.99.58 3.86 1.63 5.46L2 22l4.67-1.61c1.55.98 3.37 1.55 5.37 1.55 5.53 0 10.02-4.49 10.02-10.02C22.06 6.49 17.57 2 12.04 2z" />
    </svg>
  );
}

export default function ProductCard({ product, onOpen }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const price = productPrice(product);
  const outOf5 = trustOutOf5(product?.seller_trust_score);
  const academic = inferAcademicMeta(product);
  const suggestedRaw = product?.suggested_price;
  const listedRaw = product?.listed_price;
  const suggested =
    suggestedRaw === null || suggestedRaw === undefined || suggestedRaw === ""
      ? null
      : Number(suggestedRaw);
  const listed =
    listedRaw === null || listedRaw === undefined || listedRaw === ""
      ? null
      : Number(listedRaw);
  /* Only surface the AI price when it's a believable estimate for this
     listing — filters out stale seed values (e.g. suggested ₹80 on a ₹289 item). */
  const showSuggestion =
    suggested !== null &&
    listed !== null &&
    Number.isFinite(suggested) &&
    Number.isFinite(listed) &&
    suggested > 0 &&
    listed > 0 &&
    suggested !== 80 &&
    suggested >= listed * 0.5 &&
    suggested <= listed * 2 &&
    Math.round(suggested) !== Math.round(listed);
  const posted = relativeTime(product?.created_at);

  const hasValidImage = Boolean(product?.image_url) && !imageError;
  const targetId =
    product?.id ||
    (product?.title || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const handleCardClick = () => {
    if (onOpen) onOpen();
    navigate(`/product/${encodeURIComponent(targetId)}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Inspect ${product?.title || "listing"}`}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-200 hover:border-line-strong hover:shadow-[0_1px_2px_rgba(28,25,23,0.05),0_12px_28px_-18px_rgba(28,25,23,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sunken">
        {hasValidImage ? (
          <img
            src={product.image_url}
            alt=""
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="flex flex-col items-center gap-2 text-faint">
              <ImageOff className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-medium">
                {product?.category || "Campus item"}
              </span>
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full border border-line bg-card/95 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur">
          {product?.category || "Uncategorised"}
        </span>

        <button
          type="button"
          aria-label="Share listing to WhatsApp"
          title="Share to WhatsApp"
          onClick={(e) => {
            e.stopPropagation();
            const url = buildWhatsAppShareUrl(product);
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line/70 bg-card/95 text-[#25D366] shadow-xs backdrop-blur transition hover:scale-110 hover:bg-[#25D366] hover:text-white"
        >
          <WhatsAppIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base leading-snug">{product?.title}</h3>
          
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            {product?.college_name && (
              <span className="flex items-center gap-1 font-medium text-ink-soft">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span className="truncate max-w-[150px]">{product.college_name}</span>
              </span>
            )}
            <span className="rounded-md border border-line/70 bg-sunken px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
              {academic.badge}
            </span>
          </div>

          {product?.description ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-[22px] font-semibold tabular-nums leading-none text-ink">
              {rupees(price)}
            </p>
            <p className="mt-1.5 text-xs text-muted">
              {conditionLabel(product?.condition)}
              {posted ? <span className="text-faint"> · {posted}</span> : null}
            </p>
          </div>

          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-[13px] font-medium tabular-nums text-ink">
              <Star className="h-3.5 w-3.5 fill-warn text-warn" aria-hidden="true" />
              {outOf5 === null ? "—" : `${outOf5.toFixed(1)} / 5`}
            </p>
            <p className="mt-1 text-[11px] text-faint">Seller rating</p>
          </div>
        </div>

        {showSuggestion ? (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-[12px] text-accent-deep">
            AI suggests {rupees(suggested)} for this condition
          </p>
        ) : null}
      </div>
    </article>
  );
}
