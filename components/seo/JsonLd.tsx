/**
 * Inyecta un bloque JSON-LD (schema.org) en el documento.
 * Server Component — se renderiza en el HTML inicial (SSR), legible por crawlers.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
