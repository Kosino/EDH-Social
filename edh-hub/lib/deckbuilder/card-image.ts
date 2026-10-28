/** Prefer full card face (readable oracle text) over art crop / small. */
export function toReadableCardImage(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace("/art_crop/", "/normal/")
    .replace("/small/", "/normal/")
    .replace("/border_crop/", "/normal/");
}
