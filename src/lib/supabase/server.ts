import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createAdminServerClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const isAnon = serviceRoleKey === (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  console.log("createAdminServerClient config check:", {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    isFallingBackToAnon: isAnon
  });
  
  return createClient(supabaseUrl, serviceRoleKey);
}
