// src/lib/actions.js
// ------------------------------------------------------------
// Server Action: capture email lead into Supabase `leads` table
//
// Required Supabase table (run this SQL in your Supabase dashboard):
//
//   create table leads (
//     id uuid primary key default gen_random_uuid(),
//     email text not null unique,
//     source text default 'waitlist',
//     created_at timestamptz default now()
//   );
//
//   -- Enable RLS
//   alter table leads enable row level security;
//
//   -- Only service role key can insert (used server-side, safe)
//   create policy "Service role insert" on leads
//     for insert with check (true);
// ------------------------------------------------------------

"use server";

import { supabase } from "./supabase";

export async function captureEmail(formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const { error } = await supabase
    .from("leads")
    .insert({ email, source: "waitlist" });

  if (error) {
    // Unique constraint = already signed up
    if (error.code === "23505") {
      return { success: true, alreadyExists: true };
    }
    console.error("Supabase insert error:", error.message);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
