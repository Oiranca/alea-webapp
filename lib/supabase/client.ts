'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabasePublishableKey } from './config'
import type { Database } from './types'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublishableKey())
}
