"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase environment variables. URL: ${supabaseUrl ? "✓" : "✗"}, Key: ${supabaseKey ? "✓" : "✗"}`
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

