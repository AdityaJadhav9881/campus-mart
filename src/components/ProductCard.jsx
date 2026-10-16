import { BadgeCheck, ImageOff } from "lucide-react";
import {
  conditionLabel,
  productPrice,
  relativeTime,
  rupees,
  trustScore,
} from "../lib/format.js";

export default function ProductCard({ product }) {
  const price = productPrice(product);
  const trust = trustScore(product?.seller_trust_score);
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
  const showSuggestion =
    suggested !== null &&
    listed !== null &&
    Number.isFinite(suggested) &&
    Number.isFinite(listed) &&
    Math.round(suggested) !== Math.round(listed);
  const posted = relativeTime(product?.created_at);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-200 hover:border-line-strong hover:shadow-[0_1px_2px_rgba(28,25,23,0.05),0_12px_28px_-18px_rgba(28,25,23,0.35)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-sunken">
        {product?.image_url ? (
          <img
            src={product.image_url}
            alt=""
            loading="lazy"
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
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base leading-snug">{product?.title}</h3>
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
              <BadgeCheck className="h-3.5 w-3.5 text-positive" aria-hidden="true" />
              {trust === null ? "—" : `${trust}/100`}
            </p>
            <p className="mt-1 text-[11px] text-faint">Seller trust</p>
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
