import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export function updateSession(request: NextRequest) {
  // Placeholder for updating session in middleware
  const response = NextResponse.next();
  return response;
}
