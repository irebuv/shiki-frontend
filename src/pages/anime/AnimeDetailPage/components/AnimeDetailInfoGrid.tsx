import { imageUrl } from '@/lib/imageUrl';
import { capitalize } from '@/lib/stringUtils';
import type { ReactNode } from 'react';

type AnimeDetailInfoGridProps = {
    status?: string | null;
    type?: string | null;
    seasonYear?: number | null;
    season?: string | null;
    ageRating?: string | null;
    studioName?: string | null;
    studioImage?: string | null;
    episodes?: number | null;
    episodeTime?: number | null;
    typeLabelMap: Record<string, string>;
};

const displayValue = (value?: string | number | null) =>
    value === null || value === undefined || value === '' ? '-' : String(value);

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
    <div className="flex items-center gap-2">
        <span className="w-36 text-muted-foreground">{label}</span>
        <span>{value}</span>
    </div>
);

export const AnimeDetailInfoGrid = ({
    status,
    type,
    seasonYear,
    season,
    ageRating,
    studioName,
    studioImage,
    episodes,
    episodeTime,
    typeLabelMap,
}: AnimeDetailInfoGridProps) => {
    const studioImageUrl = imageUrl(studioImage);

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className='flex flex-col gap-2'>
                <InfoRow label="Status" value={capitalize(status)} />
                <InfoRow label="Type" value={type ? (typeLabelMap[type] ?? type) : '-'} />
                <InfoRow label="Year" value={displayValue(seasonYear)} />
                <InfoRow label="Season" value={capitalize(season)} />
                <InfoRow label="Age rating" value={displayValue(ageRating)} />
                <InfoRow label="Studio" value={displayValue(studioName)} />
                <InfoRow label="Episodes" value={displayValue(episodes)} />
            </div>
            <div className='justify-self-center w-1/2'>
                <span className='text-2xl'>Studio:</span>
                {studioImageUrl ? (
                    <img className='mt-2' src={studioImageUrl} alt={studioName ?? 'Studio'} />
                ) : (
                    <div className='mt-2 text-sm text-muted-foreground'>No studio image</div>
                )}
            </div>
        </div>
    );
};
