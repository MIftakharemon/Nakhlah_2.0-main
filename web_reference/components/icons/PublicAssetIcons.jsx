import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 36,
  lg: 48,
  xl: 72,
  xxl: 96,
  xxxl: 128,
};

function AssetIcon({ src, alt, size = "md", className, ...props }) {
  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <Image
      src={src}
      alt={alt}
      width={dimensions}
      height={dimensions}
      className={cn("object-contain", className)}
      {...props}
    />
  );
}

export function DatesIcon(props) {
  return <AssetIcon src="/icons/dates.svg" alt="Dates" {...props} />;
}

export function PalmIcon(props) {
  return <AssetIcon src="/icons/Palm_Tree.svg" alt="Palm" {...props} />;
}

export function StreakIcon(props) {
  return <AssetIcon src="/icons/active-streak.svg" alt="Streak" {...props} />;
}

export function InjazStarIcon(props) {
  return <AssetIcon src="/icons/star.svg" alt="Injaz" {...props} />;
}
