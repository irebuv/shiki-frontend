import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DESCRIPTION_LINE_OPTIONS, type DescriptionLines } from '@/lib/descriptionLines';
type Props = {
    lines: DescriptionLines;
    setLines: (v: DescriptionLines) => void;
};
export function DescriptionLinesSelect({ lines, setLines }: Props) {
    return (
        <Select
            value={String(lines)}
            onValueChange={(v) => setLines(v === 'all' ? 'all' : (Number(v) as DescriptionLines))}
        >
            <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder="Lines" />
            </SelectTrigger>

            <SelectContent>
                {DESCRIPTION_LINE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                        {n === 'all' ? 'all' : n}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
