"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { getSectionColumns } from "@/features/sections/page/columns";
import type { Section } from "@/types";

export default function SectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>(
    {},
  );
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionsRes, actionsRes] = await Promise.all([
        fetch("/api/sections"),
        fetch("/api/raffle-actions?pageSize=5000"),
      ]);
      const sectionsData = await sectionsRes.json();
      const actionsData = await actionsRes.json();

      const counts: Record<string, number> = {};
      sectionsData.forEach((s: Section) => {
        const res = actionsData.data?.filter((a: any) => a.section_id === s.id);
        counts[s.id] = res?.length ?? 0;
      });
      setActionCounts(counts);

      const sCounts: Record<string, number> = {};
      const studentsRes = await fetch("/api/students");
      const studentsData = await studentsRes.json();
      studentsData.forEach((s: any) => {
        sCounts[s.section_id] = (sCounts[s.section_id] || 0) + 1;
      });
      setStudentCounts(sCounts);

      const filtered = sectionsData.filter(
        (s: Section) => (sCounts[s.id] || 0) > 0,
      );
      setSections(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = getSectionColumns(studentCounts, actionCounts);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Secciones</h1>

      <DataTable
        columns={columns}
        data={sections}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyMessage="No hay secciones registradas"
        onRowClick={(section) => router.push(`/sections/${section.id}`)}
      />
    </div>
  );
}
