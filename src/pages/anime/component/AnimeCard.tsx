import { Anime } from "@/types/anime";
import { useState } from "react";

interface Props {
    anime: Anime;
}

export function AnimeCard({anime}: Props){
    const [open, setOpen] = useState(false);

    const {refs, floatingStyles, context} = useFloating({})
}