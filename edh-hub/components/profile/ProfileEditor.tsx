"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { saveCustomAvatarUrl, updateProfileSettings } from "@/app/profile/actions";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { AVATAR_PRESETS } from "@/lib/avatars";
import { MAX_BIO_LENGTH } from "@/lib/profile/bio";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
  rawDisplayName: string | null;
  bio: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  moxfieldUserUrl: string | null;
};

export default function ProfileEditor({
  displayName,
  rawDisplayName,
  bio,
  avatarKey,
  avatarUrl,
  moxfieldUserUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(avatarKey);
  const [clearCustom, setClearCustom] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingUpload, startUpload] = useTransition();
  const [state, action] = useActionState(updateProfileSettings, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-xl border border-primary px-3.5 py-1.5 text-sm text-primary transition hover:bg-primary/10"
      >
        Upravit profil
      </button>
    );
  }

  function onUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Nahraj obrázek (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Maximální velikost je 2 MB.");
      return;
    }
    setUploadError(null);
    startUpload(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUploadError("Nejsi přihlášený.");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) {
        setUploadError(
          error.message.includes("Bucket not found")
            ? "Chybí Storage bucket avatars — spusť migraci profile_avatars.sql."
            : "Nahrání se nepovedlo."
        );
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const result = await saveCustomAvatarUrl(data.publicUrl);
      if (result?.error) {
        setUploadError(result.error);
        return;
      }
      setSelectedKey(null);
      setClearCustom(false);
      window.location.reload();
    });
  }

  return (
    <form action={action} className="mt-6 max-w-2xl space-y-5 border-t border-white/10 pt-5">
      <FormError error={state?.error || uploadError || undefined} />
      <input type="hidden" name="avatarKey" value={selectedKey ?? "none"} />
      <input type="hidden" name="clearCustomAvatar" value={clearCustom ? "1" : "0"} />

      <Field label="Přezdívka" hint="Zobrazované jméno. @username zůstává beze změny.">
        <input
          name="displayName"
          defaultValue={rawDisplayName ?? displayName}
          maxLength={40}
          className={fieldClass}
          placeholder="Tvoje přezdívka"
        />
      </Field>

      <Field label="Popis" hint="Prázdný popis se ukáže jako „Zatím bez popisu.“">
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          maxLength={MAX_BIO_LENGTH}
          rows={4}
          className={fieldClass}
        />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Avatar z galerie</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {AVATAR_PRESETS.map((preset) => {
            const active = selectedKey === preset.key && !avatarUrl;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setSelectedKey(preset.key);
                  setClearCustom(true);
                }}
                className={cn(
                  "overflow-hidden rounded-xl border transition",
                  active ? "border-primary ring-2 ring-primary/40" : "border-white/10 hover:border-primary/40"
                )}
                title={preset.label}
              >
                <Image
                  src={preset.src}
                  alt={preset.label}
                  width={120}
                  height={120}
                  className="aspect-square w-full object-cover"
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-2 text-xs text-foreground/55 hover:text-foreground"
          onClick={() => {
            setSelectedKey(null);
            setClearCustom(true);
          }}
        >
          Bez preset avataru (inicialy)
        </button>
      </div>

      <Field
        label="Vlastní profilový obrázek"
        hint="Volitelné. Přepíše galerii. Max 2 MB. Vyžaduje Storage bucket avatars."
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={pendingUpload}
          onChange={(e) => onUpload(e.target.files)}
          className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-1.5 file:text-sm file:text-primary"
        />
        {avatarUrl ? (
          <p className="mt-2 text-xs text-foreground/50">Aktuálně máš nahraný vlastní obrázek.</p>
        ) : null}
        {pendingUpload ? <p className="mt-1 text-xs text-primary">Nahrávám…</p> : null}
      </Field>

      <Field label="Moxfield účet" hint="Odkaz na tvůj veřejný profil, např. https://moxfield.com/users/Kosino">
        <input
          name="moxfieldUserUrl"
          defaultValue={moxfieldUserUrl ?? ""}
          placeholder="https://moxfield.com/users/…"
          className={fieldClass}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <div className="sm:max-w-48">
          <SubmitButton label="Uložit profil" />
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}
