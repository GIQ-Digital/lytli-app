import { createBrowserClient } from "@supabase/ssr"

// Placeholder client — wire up real auth/queries in Cursor.
// Env vars are provided by the Supabase integration when connected.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
)
