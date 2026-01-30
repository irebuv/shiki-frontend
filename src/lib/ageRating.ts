import { AdminFormFieldOption } from "@/types/admin/adminTable";

export const AGE_RATING_OPTIONS: AdminFormFieldOption[] = [
    { value: 'G', label: 'G' },
    { value: 'PG', label: 'PG' },
    { value: 'PG-13', label: 'PG-13' },
    { value: 'R-17', label: 'R-17' },
    { value: 'R+', label: 'R+' },
    { value: 'Rx', label: 'Rx' },
] as const;