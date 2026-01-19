import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "table.description.lines";

export function useDescriptionLines<T extends number | string = number | string>(defaultLines: T) {
    const [lines, setLines] = useLocalStorage<T>(STORAGE_KEY, defaultLines);

    return {lines, setLines};
}
