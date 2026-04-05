// Public-safe Supabase config getters.
// Safe to import in Client Components, middleware, and server code.
// Does NOT include server-only guard — intentionally browser-safe.

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getSupabaseUrl(): string {
  return requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
}

export function getSupabasePublishableKey(): string {
  return requiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
}
