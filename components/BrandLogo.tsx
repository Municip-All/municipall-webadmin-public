import Image from "next/image";
import clsx from "clsx";
import logoColors from "@/assets/logo_colors.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8", img: 32 },
  md: { box: "h-10 w-10", img: 40 },
  lg: { box: "h-14 w-14", img: 56 },
};

export default function BrandLogo({
  size = "md",
  showWordmark = false,
  className,
}: BrandLogoProps) {
  const s = sizes[size];

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div
        className={clsx(
          s.box,
          "relative shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80 shadow-sm"
        )}
      >
        <Image
          src={logoColors}
          alt="Municip'All"
          width={s.img}
          height={s.img}
          className="h-full w-full object-contain p-1"
          priority
        />
      </div>
      {showWordmark && (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            Municip&apos;All
          </p>
          <p className="text-[11px] font-medium text-slate-500">Panel admin</p>
        </div>
      )}
    </div>
  );
}
