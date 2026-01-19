import { cn } from '@/lib/utils';
import { useLayoutEffect, useRef, useState } from 'react';
import { type DescriptionLines } from '@/lib/descriptionLines';
type Props = {
    text: string;
    lines?: DescriptionLines;
    className?: string;
};

export function ExpandableText({ text, lines = 5, className }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const recompute = () => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        if (lines === 'all') {
            setCanToggle(false);
            container.style.maxHeight = 'none';
            return;
        }

        const computed = window.getComputedStyle(content);
        const lineHeight = parseFloat(computed.lineHeight);
        const collapsedHeight = lineHeight * lines;

        const fullHeight = content.scrollHeight;

        setCanToggle(fullHeight > collapsedHeight + 1);

        container.style.maxHeight = expanded ? `${fullHeight}px` : `${collapsedHeight}px`;
    };
    useLayoutEffect(() => {
        recompute();
        window.addEventListener('resize', recompute);
        return () => window.removeEventListener('resize', recompute);
    }, [text, lines, expanded]);

    if (!text) return null;

    return (
        <div className={className}>
            <div
                ref={containerRef}
                className={cn(
                    'relative overflow-hidden transition-[max-height] duration-300 ease-in-out'
                )}
            >
                <div ref={contentRef} className="text-sm leading-relaxed">
                    {text}
                </div>

                {!expanded && canToggle && (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-linear-to-t from-background to-transparent" />
                )}
            </div>

           {canToggle && lines !== "all" && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 text-xs font-medium hover:underline cursor-pointer text-chart-1"
                >
                    {expanded ? 'Show less' : 'Show more...'}
                </button>
            )}
        </div>
    );
}
