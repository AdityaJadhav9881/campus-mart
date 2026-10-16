import { useMemo } from "react";
import { qrMatrix } from "../lib/qrcode.js";

export default function QrCode({
  value,
  size = 168,
  className = "",
  background = "#ffffff",
  foreground = "#1c1917",
}) {
  const matrix = useMemo(() => {
    try {
      return qrMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-xl border border-line bg-sunken p-3 text-center ${className}`}
      >
        <span className="break-all text-xs leading-relaxed text-muted">
          {value}
        </span>
      </div>
    );
  }

  const quiet = 4;
  const dim = matrix.length + quiet * 2;
  let path = "";
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix.length; x++) {
      if (matrix[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      role="img"
      aria-label={`QR code for ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={dim} height={dim} fill={background} />
      <path d={path} fill={foreground} />
    </svg>
  );
}
