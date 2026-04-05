// Validated Supabase configuration — fails fast if required env vars are missing.
// Import from this module instead of reading process.env directly in client factories.

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

export function getSupabaseSecretKey(): string {
  return requiredEnv('SUPABASE_SECRET_DEFAULT_KEY')
}
