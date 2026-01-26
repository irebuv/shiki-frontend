import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMemo, useState } from 'react';

type AdminFilterItem = {
    id: number;
    title: string;
    visible?: boolean;
};

type AdminFiltersMap = Record<string, AdminFilterItem[]>;

type AnimeAdminFiltersProps = {
    filters?: AdminFiltersMap | null;
    value?: number[];
    onChange?: (next: number[]) => void;
    readOnly?: boolean;
};

export function AnimeAdminFilters({
    filters,
    value,
    onChange,
    readOnly = false,
}: AnimeAdminFiltersProps) {
    if (!filters || !Object.keys(filters).length) return null;
    const [collapsed, setCollapsed] = useLocalStorage('admin.filters.collapsed', false);
    const [localValue, setLocalValue] = useState<number[]>([]);

    const currentValue = value ?? localValue;
    const selectedSet = useMemo(() => new Set(currentValue), [currentValue]);

    const toggleFilter = (id: number) => {
        if (readOnly) return;
        const next = new Set(selectedSet);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        const nextArr = Array.from(next);
        if (onChange) {
            onChange(nextArr);
        } else {
            setLocalValue(nextArr);
        }
    };

    return (
        <div className={`admin-filters ${collapsed ? 'is-collapsed' : ''}`}>
            <Button
                variant="filter"
                type="button"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? 'Show filters' : 'Hide filters'}
            </Button>
            <div className="admin-filters-body">
                <div className="admin-filters-grid">
                    {Object.entries(filters).map(([groupTitle, items]) => (
                        <div key={groupTitle} className="admin-filter-group">
                            <div className="admin-filter-header">
                                <h6>{groupTitle}</h6>
                            </div>
                            <div className="admin-filter-list">
                                {items.map((el) => {
                                    const isActive = selectedSet.has(el.id);
                                    const inputId = `admin-filter-${groupTitle}-${el.id}`;
                                    return (
                                        <div key={el.id} className="admin-filter-item">
                                            <div className="filter-checks">
                                                <Input
                                                    id={inputId}
                                                    className="demo1"
                                                    type="checkbox"
                                                    checked={isActive}
                                                    disabled={readOnly}
                                                    onChange={() => toggleFilter(el.id)}
                                                />
                                                <Label
                                                    htmlFor={inputId}
                                                    data-on-label="ON"
                                                    data-off-label="OFF"
                                                />
                                            </div>
                                            <div className="admin-filter-label">{el.title}</div>
                                            {el.visible === false && (
                                                <div className="admin-filter-note">
                                                    (This filter invisible)
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
