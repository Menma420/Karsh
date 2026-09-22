"use client";

import React from "react";

interface RichTextProps {
  text: string;
  className?: string;
}

/**
 * Renders plain text with bullet-point support.
 * Lines starting with `- `, `* `, or `• ` are rendered as styled list items.
 * Everything else renders as paragraphs with preserved line breaks.
 */
export function RichText({ text, className = "" }: RichTextProps) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentBullets: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const content = paragraphLines.join("\n");
      elements.push(
        <p key={`p-${elements.length}`} className="whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      );
      paragraphLines = [];
    }
  };

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1 pl-4">
          {currentBullets.map((b, i) => (
            <li key={i} className="relative pl-3 before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-[#C9A26D]">
              {b}
            </li>
          ))}
        </ul>
      );
      currentBullets = [];
    }
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^[\-\*•]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      currentBullets.push(bulletMatch[1]);
    } else {
      flushBullets();
      paragraphLines.push(line);
    }
  }

  flushBullets();
  flushParagraph();

  return <div className={`space-y-2 text-xs text-[#EDEAE3] ${className}`}>{elements}</div>;
}
