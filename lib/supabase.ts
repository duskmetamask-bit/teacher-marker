import { createClient, SupabaseClient } from "@supabase/supabase-js";

function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface TeacherProfile {
  id?: string;
  session_id: string;
  name: string;
  year_levels: string[];
  subjects: string[];
  created_at?: string;
  updated_at?: string;
}

export async function getOrCreateTeacherProfile(
  sessionId: string
): Promise<TeacherProfile | null> {
  const client = createSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("teacher_profiles")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("Supabase getOrCreate error:", error);
      return null;
    }

    if (data) return data as TeacherProfile;

    // Create new profile
    const { data: newData, error: insertError } = await client
      .from("teacher_profiles")
      .insert({ session_id: sessionId })
      .select("*")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return null;
    }

    return newData as TeacherProfile;
  } catch (e) {
    console.error("Supabase getOrCreate exception:", e);
    return null;
  }
}

export async function saveTeacherProfile(
  sessionId: string,
  profile: { name: string; yearLevels: string[]; subjects: string[] }
): Promise<TeacherProfile | null> {
  const client = createSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("teacher_profiles")
      .update({
        name: profile.name,
        year_levels: profile.yearLevels,
        subjects: profile.subjects,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase save error:", error);
      return null;
    }

    return data as TeacherProfile;
  } catch (e) {
    console.error("Supabase save exception:", e);
    return null;
  }
}

export async function getTeacherProfile(
  sessionId: string
): Promise<TeacherProfile | null> {
  const client = createSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("teacher_profiles")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("Supabase get error:", error);
      return null;
    }

    return data as TeacherProfile | null;
  } catch (e) {
    console.error("Supabase get exception:", e);
    return null;
  }
}
