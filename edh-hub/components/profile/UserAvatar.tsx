import Image from "next/image";
import { avatarSrc } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export default function UserAvatar({
  displayName,
  avatarKey,
  avatarUrl,
  className,
  size = 40,
}: {
  displayName: string;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  className?: string;
  size?: number;
}) {
  const src = avatarSrc({ avatarKey, avatarUrl });
  const initial = displayName.slice(0, 1).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("rounded-full object-cover ring-2 ring-primary/30", className)}
        unoptimized={src.startsWith("https://")}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual font-semibold text-white ring-2 ring-primary/30",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.35) }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
