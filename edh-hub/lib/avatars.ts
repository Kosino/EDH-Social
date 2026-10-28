export type AvatarPreset = {
  key: string;
  label: string;
  src: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { key: "dwarf-tinkerer", label: "Trpaslík technik", src: "/avatars/dwarf-tinkerer.png" },
  { key: "dark-elf", label: "Temný elf", src: "/avatars/dark-elf.png" },
  { key: "forest-elf", label: "Lesní elf", src: "/avatars/forest-elf.png" },
  { key: "stone-golem", label: "Kamenný golem", src: "/avatars/stone-golem.png" },
  { key: "purple-bard", label: "Bard", src: "/avatars/purple-bard.png" },
  { key: "shadow-rogue", label: "Stínový rogue", src: "/avatars/shadow-rogue.png" },
  { key: "mech-bird", label: "Mechanický pták", src: "/avatars/mech-bird.png" },
  { key: "horn-warrior", label: "Rohatý válečník", src: "/avatars/horn-warrior.png" },
  { key: "star-wizard", label: "Hvězdný mág", src: "/avatars/star-wizard.png" },
];

const PRESET_KEYS = new Set(AVATAR_PRESETS.map((a) => a.key));

export function isAvatarKey(value: string | null | undefined): value is string {
  return Boolean(value && PRESET_KEYS.has(value));
}

export function avatarSrc(opts: {
  avatarUrl?: string | null;
  avatarKey?: string | null;
}): string | null {
  if (opts.avatarUrl) return opts.avatarUrl;
  if (isAvatarKey(opts.avatarKey)) {
    return `/avatars/${opts.avatarKey}.png`;
  }
  return null;
}
