import { Anime } from '@/types/anime';
import { useRef, useState } from 'react';
import {
    FloatingArrow,
    FloatingPortal,
    autoUpdate,
    arrow,
    flip,
    offset,
    shift,
    useFloating,
    useHover,
    useInteractions,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
interface Props {
    anime: Anime;
}

export function AnimeCard({ anime }: Props) {
    const [open, setOpen] = useState(false);

    const ARROW_H = 20;
    const arrowRef = useRef<SVGSVGElement | null>(null);

    const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'right-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        transform: false,
        middleware: [
            offset(ARROW_H + 8),
            shift({ padding: 10 }),
            flip({
                padding: 10,
                fallbackPlacements: ['left-start', 'top', 'bottom'],
            }),
            arrow({ element: arrowRef }),
        ],
    });

    const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
    const align = placement.split('-')[1] as 'start' | 'end' | undefined;
    const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];
    const arrowStyle =
        side === 'right' || side === 'left' ? { top: '12px' } : { left: '12px' };

    const hover = useHover(context, {
        delay: { open: 100, close: 80 },
        move: false,
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    return (
        <>
            {/* CARD */}
            <div ref={refs.setReference} {...getReferenceProps()} className="cursor-pointer">
                <img
                    className="aspect-2/3 w-full rounded-lg object-cover"
                    src={`http://localhost:8082/storage/${anime.featured_image}`}
                    alt={anime.name}
                />
                <p className="mt-2 text-sm line-clamp-2">{anime.name}</p>
            </div>

            {/* POPOVER */}
            <FloatingPortal>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            ref={refs.setFloating}
                            {...getFloatingProps()}
                            style={floatingStyles}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeOut',
                            }}
                            className="relative z-50 w-80 rounded-xl bg-card p-4 shadow-xl"
                        >
                            <FloatingArrow
                                context={context}
                                ref={arrowRef}
                                height={ARROW_H}
                                width={ARROW_H * 2}
                                tipRadius={2}
                                strokeWidth={1}
                                style={arrowStyle}
                                className="fill-card mt-3"
                            />
                            {/* content */}
                            <div className="flex gap-3">
                                <img
                                    src={`http://localhost:8082/storage/${anime.featured_image}`}
                                    alt=""
                                    className="h-24 w-16 rounded-md object-cover"
                                />
                                <div className="min-w-0">
                                    <h4 className="truncate text-sm font-semibold">{anime.name}</h4>
                                </div>
                            </div>
                            {anime.description && (
                                <p className="mt-3 line-clamp-6 text-md text-muted-foreground">
                                    {anime.description}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </FloatingPortal>
        </>
    );
}
