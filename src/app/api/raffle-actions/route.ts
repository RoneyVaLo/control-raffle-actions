import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const paymentMethod = searchParams.get("payment_method");
  const sectionId = searchParams.get("section_id");
  const studentId = searchParams.get("student_id");
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 25;

  let preFilterStudentIds: string[] | null = null;

  if (sectionId || (query && isNaN(parseInt(query, 10)))) {
    let studentQuery = supabase.from("students").select("id");
    if (sectionId) studentQuery = studentQuery.eq("section_id", sectionId);
    if (query && isNaN(parseInt(query, 10))) {
      studentQuery = studentQuery.ilike("full_name", `%${query}%`);
    }
    const { data: matchingStudents } = await studentQuery;
    if (!matchingStudents || matchingStudents.length === 0) {
      return NextResponse.json({ data: [], total: 0, page, totalPages: 0 });
    }
    preFilterStudentIds = matchingStudents.map((s: any) => s.id);
  }

  let dataQuery = supabase.from("raffle_actions").select("*", { count: "exact" });

  if (status) dataQuery = dataQuery.eq("status", status);
  if (paymentMethod) dataQuery = dataQuery.eq("payment_method", paymentMethod);
  if (studentId) dataQuery = dataQuery.eq("student_id", studentId);
  if (preFilterStudentIds) dataQuery = dataQuery.in("student_id", preFilterStudentIds);
  if (query && !isNaN(parseInt(query, 10))) {
    dataQuery = dataQuery.eq("action_number", parseInt(query, 10));
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await dataQuery
    .order("action_number", { ascending: true })
    .range(from, to);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const actionData = data ?? [];

  const uniqueStudentIds = [...new Set(actionData.map((a: any) => a.student_id))];
  const studentMap: Record<string, { full_name: string; section_id: string; section_name?: string }> = {};

  if (uniqueStudentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, section_id")
      .in("id", uniqueStudentIds);

    if (students) {
      students.forEach((s: any) => {
        studentMap[s.id] = { full_name: s.full_name, section_id: s.section_id };
      });

      const uniqueSectionIds = [...new Set(students.map((s: any) => s.section_id))];
      if (uniqueSectionIds.length > 0) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name")
          .in("id", uniqueSectionIds);

        if (sections) {
          const sectionNameMap: Record<string, string> = {};
          sections.forEach((s: any) => { sectionNameMap[s.id] = s.name; });

          students.forEach((s: any) => {
            studentMap[s.id].section_name = sectionNameMap[s.section_id] || "";
          });
        }
      }
    }
  }

  const mapped = actionData.map((a: any) => ({
    id: a.id,
    action_number: a.action_number,
    student_id: a.student_id,
    status: a.status,
    payment_method: a.payment_method,
    assigned_at: a.assigned_at,
    paid_at: a.paid_at,
    updated_at: a.updated_at,
    student_name: studentMap[a.student_id]?.full_name,
    section_name: studentMap[a.student_id]?.section_name,
    section_id: studentMap[a.student_id]?.section_id,
  }));

  return NextResponse.json({
    data: mapped,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_id, action_numbers } = body;

  if (!student_id || !action_numbers?.length) {
    return NextResponse.json(
      { error: "Estudiante y números de acción son requeridos" },
      { status: 400 },
    );
  }

  const existing = await supabase
    .from("raffle_actions")
    .select("action_number")
    .in("action_number", action_numbers);

  if (existing.data && existing.data.length > 0) {
    const existingNumbers = existing.data.map((a) => a.action_number);
    return NextResponse.json(
      { error: `Acciones ya existentes: ${existingNumbers.join(", ")}` },
      { status: 409 },
    );
  }

  const records = action_numbers.map((num: number) => ({
    action_number: num,
    student_id,
    status: "PENDING" as const,
  }));

  const { data, error } = await supabase
    .from("raffle_actions")
    .insert(records)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
