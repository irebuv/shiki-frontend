import React from "react";
import {motion} from "framer-motion";

export default function Logo({className}: React.ComponentProps<"div">){
    return (
        <motion.div
            whileHover={{ scale: 1.3}}
            className="text-3xl font-bold text-blue-600 cursor-pointer"
        >
            Logo
        </motion.div>
    )
}