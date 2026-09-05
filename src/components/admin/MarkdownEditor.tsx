"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function MarkdownEditor({
  value,
  onChange,
  rows = 18,
  testId = "markdown-editor",
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  testId?: string;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium text-earth/60">Markdown</span>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-forest hover:bg-muted"
        >
          {preview ? (
            <>
              <Pencil className="h-3.5 w-3.5" /> Write
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Preview
            </>
          )}
        </button>
      </div>
      {preview ? (
        <div className="prose prose-sm max-w-none p-4 prose-headings:font-serif">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || "_Nothing to preview_"}
          </ReactMarkdown>
        </div>
      ) : (
        <Textarea
          data-testid={testId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="rounded-none border-0 font-mono text-[13px] focus-visible:ring-0"
          placeholder="Write your post in Markdown…"
        />
      )}
    </div>
  );
}
