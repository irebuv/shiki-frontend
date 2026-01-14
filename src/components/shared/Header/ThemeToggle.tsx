import { useAppTheme } from '@/lib/theme/AppThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const { toggleTheme, resolvedTheme } = useAppTheme();
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <button
                onClick={(e) => toggleTheme(e)}
                className="rounded-md border px-3 py-2 cursor-pointer"
            >
                {resolvedTheme === 'dark' ? '🌙' : '☀️'}
            </button>
        </div>
    );
};
