export interface AdminFilterNested {
    id: number;
    title: string;
    visible: boolean;
    visible_label: string;
    filter_group_id: number;
}

export interface AdminFilterGroupWithFilters {
    id: number;
    title: string;
    filters: AdminFilterNested[];
    created_at: string | null;
    updated_at: string | null;
}

export interface FilterGroupsAdminResponse {
    filterGroups: AdminFilterGroupWithFilters[];
}
