import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ClassForm } from "@/components/recepcion/ClassForm";
import { PageHeader } from "@/components/recepcion/ui";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await prisma.classTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  return (
    <>
      <Link
        href="/recepcion/clases"
        className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/50 hover:text-gold"
      >
        ← Clases
      </Link>
      <PageHeader title={`Editar: ${template.name}`} subtitle={template.id} />
      <ClassForm template={template} />
    </>
  );
}
