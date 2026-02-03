"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type ChatMode = "creator" | "business";

interface MarkdownRendererProps {
  content: string;
  mode: ChatMode;
  className?: string;
}

// ============================================
// ACTION ITEM DETECTOR
// ============================================
const isActionItem = (text: string): boolean => {
  const patterns = [
    /^step\s*\d+[:.]/i,
    /^\d+[.)]\s/,
    /^action[:.]/i,
    /^next step[:.]/i,
    /^recommendation[:.]/i,
    /^шаг\s*\d+[:.]/i, // Russian
    /^действие[:.]/i,
  ];
  return patterns.some((p) => p.test(text.trim()));
};

// ============================================
// MARKDOWN RENDERER
// ============================================
export function MarkdownRenderer({ content, mode, className }: MarkdownRendererProps) {
  // Clean up content
  const cleanContent = content
    .replace(/\*\*/g, "**") // Keep bold
    .replace(/—/g, "–")
    .replace(/__/g, "**"); // Convert underscores to bold

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn("markdown-content", className)}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1
            className={cn(
              "text-xl font-bold mb-3 mt-4 first:mt-0",
              mode === "creator" ? "text-violet-300" : "text-amber-300"
            )}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className={cn(
              "text-lg font-semibold mb-2 mt-3 first:mt-0",
              mode === "creator" ? "text-violet-300" : "text-amber-300"
            )}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className={cn(
              "text-base font-semibold mb-2 mt-2",
              mode === "creator" ? "text-violet-400" : "text-amber-400"
            )}
          >
            {children}
          </h3>
        ),

        // Paragraphs with action item detection
        p: ({ children }) => {
          const text = typeof children === "string" ? children : "";
          const isAction = isActionItem(text);

          if (isAction && mode === "business") {
            return (
              <p
                className={cn(
                  "mb-3 pl-3 py-1.5 border-l-2 border-amber-500/50 bg-amber-500/5 rounded-r",
                  "text-amber-100 font-medium"
                )}
              >
                {children}
              </p>
            );
          }

          return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
        },

        // Bold text
        strong: ({ children }) => (
          <strong
            className={cn(
              "font-semibold",
              mode === "creator" ? "text-violet-200" : "text-amber-200"
            )}
          >
            {children}
          </strong>
        ),

        // Italic text
        em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,

        // Unordered lists
        ul: ({ children }) => (
          <ul className="mb-3 ml-4 space-y-1.5 list-none">{children}</ul>
        ),

        // Ordered lists
        ol: ({ children }) => (
          <ol className="mb-3 ml-4 space-y-1.5 list-decimal list-inside">{children}</ol>
        ),

        // List items
        li: ({ children }) => {
          const text = typeof children === "string" ? children : "";
          const isAction = isActionItem(text);

          return (
            <li
              className={cn(
                "relative pl-4 before:absolute before:left-0 before:content-['•']",
                mode === "creator" ? "before:text-violet-500" : "before:text-amber-500",
                isAction && mode === "business" && "font-medium text-amber-100"
              )}
            >
              {children}
            </li>
          );
        },

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline underline-offset-2 transition-colors",
              mode === "creator"
                ? "text-violet-400 hover:text-violet-300"
                : "text-amber-400 hover:text-amber-300"
            )}
          >
            {children}
          </a>
        ),

        // Code blocks
        code: ({ className, children, ...props }) => {
          const isInline = !className;

          if (isInline) {
            return (
              <code
                className={cn(
                  "px-1.5 py-0.5 rounded text-sm font-mono",
                  mode === "creator"
                    ? "bg-violet-500/20 text-violet-200"
                    : "bg-amber-500/20 text-amber-200"
                )}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn(
                "block p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3",
                mode === "creator"
                  ? "bg-violet-900/30 border border-violet-500/20"
                  : "bg-amber-900/20 border border-amber-500/20"
              )}
              {...props}
            >
              {children}
            </code>
          );
        },

        // Pre blocks (for code blocks)
        pre: ({ children }) => (
          <pre className="mb-3 overflow-x-auto">{children}</pre>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote
            className={cn(
              "pl-4 py-2 my-3 border-l-2 italic",
              mode === "creator"
                ? "border-violet-500/50 bg-violet-500/5 text-violet-200"
                : "border-amber-500/50 bg-amber-500/5 text-amber-200"
            )}
          >
            {children}
          </blockquote>
        ),

        // Horizontal rules
        hr: () => (
          <hr
            className={cn(
              "my-4 border-0 h-px",
              mode === "creator" ? "bg-violet-500/30" : "bg-amber-500/30"
            )}
          />
        ),

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className={cn(
              "px-3 py-2 text-left font-semibold border-b",
              mode === "creator"
                ? "border-violet-500/30 text-violet-200"
                : "border-amber-500/30 text-amber-200"
            )}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className={cn(
              "px-3 py-2 border-b",
              mode === "creator" ? "border-violet-500/20" : "border-amber-500/20"
            )}
          >
            {children}
          </td>
        ),
      }}
    >
      {cleanContent}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
