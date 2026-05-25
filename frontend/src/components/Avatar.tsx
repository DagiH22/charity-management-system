import { useState, useMemo } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  /** When true, render a subtle border for profile images */
  withBorder?: boolean;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-2xl",
};

const bgColors = [
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-yellow-500",
  "bg-fuchsia-500",
];

function pickColor(seed?: string | null) {
  if (!seed) return bgColors[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function Avatar({
  src,
  name,
  alt,
  size = "md",
  className = "",
  withBorder = false,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = useMemo(() => {
    if (!name) return "U";
    const trimmed = name.trim();
    if (!trimmed) return "U";
    return trimmed.charAt(0).toUpperCase();
  }, [name]);

  const bg = pickColor(name || initials);

  // show image only when src present and no prior error
  const showImg = Boolean(src && !imgError);

  const sizeClasses = sizeMap[size];

  return (
    <div
      aria-hidden={false}
      className={`${sizeClasses} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${className} ${withBorder ? "ring-1 ring-slate-200" : ""}`}
      title={alt || name || "User"}
    >
      {showImg ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img
          src={src as string}
          alt={alt || name || "Profile image"}
          className={`block h-full w-full object-cover`}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={`${bg} flex h-full w-full items-center justify-center`}
        >
          <span className="select-none">{initials}</span>
        </span>
      )}
    </div>
  );
}

export type { AvatarSize };
