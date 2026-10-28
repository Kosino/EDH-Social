export const MAX_BIO_LENGTH = 500;

export function parseBio(
  value: FormDataEntryValue | null
): { ok: true; bio: string | null } | { ok: false; error: string } {
  const bio = typeof value === "string" ? value.trim() : "";
  if (bio.length > MAX_BIO_LENGTH) {
    return { ok: false, error: `Popis může mít nejvýš ${MAX_BIO_LENGTH} znaků.` };
  }
  return { ok: true, bio: bio || null };
}
