'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Color code regex patterns
const HEX_COLOR_REGEX = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/;
const RGB_COLOR_REGEX = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
const RGBA_COLOR_REGEX = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/;

function parseColorValue(colorStr: string): string {
    // Remove # if present
    const cleanColor = colorStr.replace('#', '');

    // Handle 3-digit hex
    if (cleanColor.length === 3) {
        const r = cleanColor[0] + cleanColor[0];
        const g = cleanColor[1] + cleanColor[1];
        const b = cleanColor[2] + cleanColor[2];
        return `#${r}${g}${b}`;
    }

    return colorStr.startsWith('#') ? colorStr : `#${colorStr}`;
}

function ColorCode({ colorCode }: { colorCode: string }) {
    let displayColor = colorCode;

    // Normalize hex colors
    if (colorCode.startsWith('#')) {
        displayColor = parseColorValue(colorCode);
    } else if (colorCode.startsWith('rgb')) {
        // Keep RGB as is
        displayColor = colorCode;
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-sm">
            <span
                className="inline-block w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 shrink-0"
                style={{
                    backgroundColor: colorCode.startsWith('#')
                        ? parseColorValue(colorCode)
                        : colorCode.startsWith('rgb')
                            ? colorCode
                            : colorCode,
                }}
            />
            {colorCode}
        </span>
    );
}

function processTextWithColors(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combine all regex patterns
    const combinedPattern = `(${HEX_COLOR_REGEX.source}|${RGB_COLOR_REGEX.source}|${RGBA_COLOR_REGEX.source})`;
    const regex = new RegExp(combinedPattern, 'gi');

    let match;
    let matchIndex = 0;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(<ColorCode key={`color-${matchIndex}-${match.index}`} colorCode={match[0]} />);
        lastIndex = match.index + match[0].length;
        matchIndex++;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

function processChildren(children: React.ReactNode): React.ReactNode {
    if (typeof children === 'string') {
        return processTextWithColors(children);
    }
    if (Array.isArray(children)) {
        return children.map((child, index) => {
            if (typeof child === 'string') {
                return <React.Fragment key={index}>{processTextWithColors(child)}</React.Fragment>;
            }
            return child;
        });
    }
    return children;
}

export function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => {
                        return <p>{processChildren(children)}</p>;
                    },
                    li: ({ children }) => {
                        return <li>{processChildren(children)}</li>;
                    },
                    strong: ({ children }) => {
                        return <strong>{processChildren(children)}</strong>;
                    },
                    code: ({ children, className }) => {
                        if (className) {
                            return <code className={className}>{children}</code>;
                        }
                        return <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700">{processChildren(children)}</code>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
