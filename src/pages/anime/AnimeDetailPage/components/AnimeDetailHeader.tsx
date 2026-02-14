import { ExpandableText } from '@/components/custom/ExpandableText';
import { getSeasonBadge } from '@/lib/seasonBadge';
import { capitalize } from '@/lib/stringUtils';

type AnimeDetailHeaderProps = {
    name?: string | null;
    description?: string | null;
    ratingLabel: string;
    status?: string | null;
    type?: string | null;
    ageRating?: string | null;
    season?: string | null;
    seasonYear?: number | null;
    typeLabelMap: Record<string, string>;
};

const RatingBadge = ({ rating }: { rating: string }) => (
    <div className="inline-flex items-center gap-3 rounded-xl bg-chart-5/15 px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-chart-5/35">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Rating</span>
        <span className="rounded-md bg-chart-5 px-2 py-0.5 text-base font-bold leading-none text-zinc-900">
            {rating}
        </span>
    </div>
);

export const AnimeDetailHeader = ({
    name,
    description,
    ratingLabel,
    type,
    ageRating,
    season,
    seasonYear,
    typeLabelMap,
}: AnimeDetailHeaderProps) => {
   const seasonBadge = getSeasonBadge(season, seasonYear);
    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="text-xs text-muted-foreground">{/* Breadcrumbs go here */}</div>
                <h1 className="text-2xl font-semibold leading-tight">{name ?? '-'}</h1>
                {description ? (
                    <ExpandableText
                        className="mt-2 text-sm text-muted-foreground"
                        text={description}
                        lines={3}
                    />
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <RatingBadge rating={ratingLabel} />
                <div className="flex flex-wrap gap-2 text-xs">
                    {type && (
                        <span className="rounded-full bg-secondary px-2 py-1 font-semibold text-secondary-foreground ring-1 ring-border/60">
                            {typeLabelMap[type] ?? type}
                        </span>
                    )}
                    {ageRating && (
                        <span className="rounded-full bg-chart-5/15 px-2 py-1 font-semibold text-chart-5 ring-1 ring-chart-5/35">
                            {ageRating}
                        </span>
                    )}
                    {seasonBadge && (
                     <span className={seasonBadge.className}>
                        {seasonBadge.label}
                     </span>
                    )}
                </div>
            </div>
        </div>
    );
};
