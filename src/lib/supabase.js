// src/lib/supabase.js
// ------------------------------------------------------------
// Supabase client — server-side only (used in Server Actions)
// Set these two env vars in your .env.local:
//   SUPABASE_URL=https://your-project.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
// ------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
