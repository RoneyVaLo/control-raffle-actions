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
      const res = await fetch("/api/sections");
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Error al obtener secciones:", data);
        setSections([]);
        setStudentCounts({});
        setActionCounts({});
        return;
      }

      const sCounts: Record<string, number> = {};
      const aCounts: Record<string, number> = {};
      data.forEach((s: any) => {
        sCounts[s.id] = s.student_count ?? 0;
        aCounts[s.id] = s.action_count ?? 0;
      });
      setStudentCounts(sCounts);
      setActionCounts(aCounts);

      const filtered = data.filter(
        (s: any) => (s.student_count ?? 0) > 0,
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
