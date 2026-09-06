// ------------------------------------------------------------
// Renders one or more schema.org nodes as a single <script type="application/
// ld+json"> tag. Build the nodes with src/lib/seo/structuredData.ts.
//
// A single object is emitted as-is; an array is emitted as a JSON-LD graph
// array so cross-linked @id references (Organization ↔ WebSite ↔ WebPage)
// resolve within one document.
// ------------------------------------------------------------

export default function JsonLd({ data }: { data: object | object[] }) {
  const nodes = Array.isArray(data) ? data : [data];
  const payload = nodes.length === 1 ? nodes[0] : nodes;

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
