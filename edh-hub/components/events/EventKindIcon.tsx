import { eventKindMeta } from "@/lib/events";
import { cn } from "@/lib/utils";

export default function EventKindIcon({
  eventType,
  className = "h-10 w-10",
  alt,
}: {
  eventType: string;
  className?: string;
  alt?: string;
}) {
  const meta = eventKindMeta(eventType);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static JPG icons from /public/icons
    <img
      src={meta.icon}
      alt={alt ?? meta.label}
      width={80}
      height={80}
      className={cn("shrink-0 rounded-lg object-cover", className)}
      decoding="async"
    />
  );
}
