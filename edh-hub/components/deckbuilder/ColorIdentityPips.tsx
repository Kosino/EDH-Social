import { cn } from "@/lib/utils";

const PIP: Record<string, string> = {
  W: "bg-[#f9faf4] text-black",
  U: "bg-[#0e68ab] text-white",
  B: "bg-[#150b00] text-white",
  R: "bg-[#d3202a] text-white",
  G: "bg-[#00733e] text-white",
  C: "bg-[#cbc2bf] text-black",
};

export default function ColorIdentityPips({
  colors,
  className,
}: {
  colors: string[];
  className?: string;
}) {
  if (!colors.length) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)} title="Bezbarvý">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#cbc2bf] text-[10px] font-bold text-black">
          C
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={colors.join("")}>
      {colors.map((c) => {
        const key = c.toUpperCase();
        return (
          <span
            key={key}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
              PIP[key] ?? PIP.C
            )}
          >
            {key}
          </span>
        );
      })}
    </span>
  );
}
