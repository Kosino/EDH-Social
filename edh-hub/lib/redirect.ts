export function safeNext(value: string | null | undefined) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.includes("://") || value.includes("\\") || /[\n\r]/.test(value)) return "/";
  return value;
}
