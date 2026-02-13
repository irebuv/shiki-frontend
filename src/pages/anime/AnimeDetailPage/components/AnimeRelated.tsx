import { imageUrl } from '@/lib/imageUrl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AnimeRelatedItem } from '@/types/anime';
import { capitalize } from '@/lib/stringUtils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type AnimeRelatedProps = {
    relatedItems: AnimeRelatedItem[];
    typeLabelMap: Record<string, string>;
};

export default function AnimeRelated({ relatedItems, typeLabelMap }: AnimeRelatedProps) {
    const [collapsed, setCollapsed] = useLocalStorage('anime.detail.related.collapsed', false);

    return (
        <>
            <div className={`flex items-center gap-2 ${collapsed ? 'mb-0' : 'mb-4'}`}>
                <h3 className="text-lg font-semibold">Related:</h3>
                <Button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className=" py-1.5 px-4 text-sm"
                    variant='toggle'
                    aria-expanded={!collapsed}
                >
                    {collapsed ? 'Expand' : 'Collapse'}
                </Button>
            </div>

            <div
                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
                style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
                aria-hidden={collapsed}
            >
                <div className="min-h-0">
                    <div className="grid gap-3">
                    {relatedItems.map((item, index) => {
                        const related = item.related_anime;
                        if (!related) return null;
                        const isCurrent = Boolean(item.is_current);

                        const typeLabel = related.type
                            ? (typeLabelMap[related.type] ?? related.type)
                            : null;
                        const seasonLabel =
                            related.season || related.season_year
                                ? `${capitalize(related.season, '')}${related.season_year ? ` ${related.season_year}` : ''}`.trim()
                                : null;

                        const content = (
                            <>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-sm font-semibold text-primary ring-1 ring-primary/25">
                                    {index + 1}
                                </span>

                                <div className="h-14 w-10 overflow-hidden rounded-md bg-muted/40 ring-1 ring-border/60">
                                    {related.featured_image ? (
                                        <img
                                            src={imageUrl(related.featured_image)}
                                            alt={related.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                </div>

                                <div className="min-w-0">
                                    <p
                                        className={`line-clamp-1 text-sm font-semibold ${isCurrent ? 'text-foreground' : 'text-foreground group-hover:text-primary'}`}
                                    >
                                        {related.name}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                        <span
                                            className={`rounded-full px-2 py-1 font-semibold ring-1 ${isCurrent ? 'bg-primary/15 text-primary ring-primary/30' : 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300'}`}
                                        >
                                            {isCurrent ? 'Current' : 'Open'}
                                        </span>
                                        {typeLabel ? (
                                            <span className="rounded-full bg-secondary px-2 py-1 font-semibold text-secondary-foreground ring-1 ring-border/60">
                                                {typeLabel}
                                            </span>
                                        ) : null}
                                        {seasonLabel ? (
                                            <span className="rounded-full bg-chart-1/15 px-2 py-1 font-semibold text-chart-1 ring-1 ring-chart-1/35">
                                                {seasonLabel}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </>
                        );

                        const baseClasses =
                            'grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 rounded-xl border px-3 py-2 transition-all';

                        if (isCurrent) {
                            return (
                                <div
                                    key={item.id ?? related.id}
                                    aria-current="true"
                                    className={`${baseClasses} cursor-default border-primary/25 bg-primary/5 ring-1 ring-primary/15`}
                                >
                                    {content}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.id ?? related.id}
                                to={`/anime/${related.slug}`}
                                className={`${baseClasses} group cursor-pointer border-border/70 bg-background/70 hover:border-primary/30 hover:bg-background hover:ring-1 hover:ring-primary/20`}
                                title={`Open ${related.name}`}
                            >
                                {content}
                            </Link>
                        );
                    })}
                    </div>
                </div>
            </div>
        </>
    );
}
