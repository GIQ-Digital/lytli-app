export const INVITE_COOKIE = "lytli_invite"

export function inviteAcceptPath(code: string) {
  return `/api/invite/accept?code=${encodeURIComponent(code)}`
}
