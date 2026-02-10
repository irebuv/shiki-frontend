type AnimeCoverCardProps = {
    coverUrl?: string;
    title: string;
};

export const AnimeCoverCard = ({ coverUrl, title }: AnimeCoverCardProps) => (
    <div className="flex justify-center md:justify-end self-start">
        <div className="relative w-full max-w-[230px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-black/10">
            <div className="aspect-3/4 w-full">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        No cover
                    </div>
                )}
            </div>
        </div>
    </div>
);
