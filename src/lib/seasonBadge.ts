import { capitalize } from './stringUtils';

type SeasonKey = 'winter' | 'spring' | 'summer' | 'fall';

const SEASON_COLORS: Record<SeasonKey, string> = {
    winter: 'bg-season-winter-bg text-season-winter-fg ring-1 ring-season-winter-ring',
    spring: 'bg-season-spring-bg text-season-spring-fg ring-1 ring-season-spring-ring',
    summer: 'bg-season-summer-bg text-season-summer-fg ring-1 ring-season-summer-ring',
    fall: 'bg-season-fall-bg text-season-fall-fg ring-1 ring-season-fall-ring',
};

const DEFAULT_COLORS = 'bg-muted text-muted-foreground ring-1 ring-border/60';

function normalizeSeason(season?: string | null): SeasonKey | null {
    if (!season) return null;
    const s = season.trim().toLowerCase();
    if (s === 'winter' || s === 'spring' || s === 'summer' || s === 'fall') return s;
    return null;
}

export function getSeasonBadge(season?: string | null, seasonYear?: number | null) {
    const seasonKey = normalizeSeason(season);

    if (!seasonKey && !seasonYear) return null;

    const label =
        `${seasonKey ? capitalize(seasonKey, '') : ''}${seasonYear ? `${seasonYear}` : ''}`.trim();

    return {
        label,
        className: seasonKey
            ? `rounded-full px-2 py-1 font-semibold ${SEASON_COLORS[seasonKey]}`
            : `rounded-full px-2 py-1 font-semibold ${DEFAULT_COLORS}`,
    };
}
