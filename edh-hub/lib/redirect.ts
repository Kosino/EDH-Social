const LOCAL_APP = "http://localhost:3000";

export function browserOrigin(value: string | null | undefined) {
  if (!value) return LOCAL_APP;
  try {
    const url = new URL(value);
    if (url.hostname === "0.0.0.0" || url.hostname === "127.0.0.1") url.hostname = "localhost";
    if (url.protocol !== "http:" && url.protocol !== "https:") return LOCAL_APP;
    return url.origin;
  } catch {
    return LOCAL_APP;
  }
}

export function safeNext(value: string | null | undefined) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.includes("://") || value.includes("\\") || /[\n\r]/.test(value)) return "/";
  return value;
}
