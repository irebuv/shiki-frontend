
import { Spinner } from '@radix-ui/themes';
export function LoadingOverlay() {
    return (
         <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-xs rounded-xl">
                            <div className="flex items-center gap-3 rounded-lg bg-background/80 px-4 py-3 shadow">
                                <div className="scale-150">
                                    <Spinner />
                                </div>
                                <span className="text-sm text-foreground">Loading...</span>
                            </div>
                        </div>
    )
}