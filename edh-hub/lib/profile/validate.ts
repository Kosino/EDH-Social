import { isAvatarKey } from "@/lib/avatars";
import { MAX_BIO_LENGTH, parseBio } from "@/lib/profile/bio";

export { MAX_BIO_LENGTH };

const DISPLAY_NAME_MAX = 40;

export function parseDisplayName(
  value: FormDataEntryValue | null
): { ok: true; displayName: string | null } | { ok: false; error: string } {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: true, displayName: null };
  if (raw.length > DISPLAY_NAME_MAX) {
    return { ok: false, error: `Přezdívka smí mít max. ${DISPLAY_NAME_MAX} znaků.` };
  }
  return { ok: true, displayName: raw };
}

export function parseAvatarKey(
  value: FormDataEntryValue | null
): { ok: true; avatarKey: string | null } | { ok: false; error: string } {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw === "none") return { ok: true, avatarKey: null };
  if (!isAvatarKey(raw)) return { ok: false, error: "Neplatný avatar." };
  return { ok: true, avatarKey: raw };
}

export function parseMoxfieldUserUrl(
  value: FormDataEntryValue | null
): { ok: true; url: string | null } | { ok: false; error: string } {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: true, url: null };
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || (host !== "moxfield.com" && host !== "www.moxfield.com")) {
      return { ok: false, error: "Odkaz musí být https://moxfield.com/users/…" };
    }
    const match = url.pathname.match(/^\/users\/([A-Za-z0-9_-]+)\/?$/);
    if (!match) {
      return { ok: false, error: "Očekáváme cestu /users/jméno na Moxfieldu." };
    }
    return { ok: true, url: `https://moxfield.com/users/${match[1]}` };
  } catch {
    return { ok: false, error: "Neplatná URL Moxfield účtu." };
  }
}

export function parseProfileBio(value: FormDataEntryValue | null) {
  return parseBio(value);
}
