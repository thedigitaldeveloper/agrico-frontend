/**
 * Renders a JSON-LD block.
 *
 * The payload is escaped before it reaches the DOM: content comes from the CMS,
 * and a string containing `</script>` would otherwise close the tag early and
 * turn editor-supplied text into executable markup. Escaping `<`, `>` and `&`
 * as unicode escapes keeps the JSON valid while making that impossible.
 */
function serialize(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      // The value is JSON produced by serialize() above, never raw CMS text.
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

/** Emits several graphs as one @graph, which is cheaper than repeated tags. */
export function JsonLdGraph({ items }: { items: (Record<string, unknown> | null)[] }) {
  const present = items.filter((item): item is Record<string, unknown> => item !== null);
  if (present.length === 0) return null;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': present.map((item) =>
          // Nested entries inherit the outer context, so a stray one on a
          // member would be redundant.
          Object.fromEntries(Object.entries(item).filter(([key]) => key !== '@context'))
        ),
      }}
    />
  );
}
