// Project super user. Login username is lowercase; the visible nickname is Kosino.
// The password is not stored in the repo. Further testing uses this account.
export const SUPERUSER = {
  email: "jan.kos.aiswarm@gmail.com",
  username: "kosino",
  displayName: "Kosino",
} as const;

export function isSuperuser(username: string | null | undefined) {
  return username?.toLowerCase() === SUPERUSER.username;
}

export function publicName(username: string, displayName?: string | null) {
  if (isSuperuser(username) && (!displayName || displayName.toLowerCase() === SUPERUSER.username)) {
    return SUPERUSER.displayName;
  }
  return displayName || username;
}
