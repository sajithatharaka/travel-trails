import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders trusted markdown (authored in /admin/blog) as prose. */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:text-ink-soft prose-a:text-deep-jungle prose-strong:text-ink">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
