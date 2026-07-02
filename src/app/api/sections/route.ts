import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const [sectionsRes, studentsRes, actionsRes] = await Promise.all([
    supabase.from("sections").select("*").order("name"),
    supabase.from("students").select("id, section_id"),
    supabase.from("raffle_actions").select("student_id"),
  ]);

  if (sectionsRes.error)
    return NextResponse.json({ error: sectionsRes.error.message }, { status: 500 });
  if (studentsRes.error)
    return NextResponse.json({ error: studentsRes.error.message }, { status: 500 });
  if (actionsRes.error)
    return NextResponse.json({ error: actionsRes.error.message }, { status: 500 });

  const students = studentsRes.data ?? [];
  const actions = actionsRes.data ?? [];

  const studentSectionMap: Record<string, string> = {};
  const studentCounts: Record<string, number> = {};
  for (const s of students) {
    studentSectionMap[s.id] = s.section_id;
    studentCounts[s.section_id] = (studentCounts[s.section_id] || 0) + 1;
  }

  const actionCounts: Record<string, number> = {};
  for (const a of actions) {
    const sectionId = studentSectionMap[a.student_id];
    if (sectionId) {
      actionCounts[sectionId] = (actionCounts[sectionId] || 0) + 1;
    }
  }

  const data = sectionsRes.data.map((s: any) => ({
    ...s,
    student_count: studentCounts[s.id] || 0,
    action_count: actionCounts[s.id] || 0,
  }));

  return NextResponse.json(data);
}
