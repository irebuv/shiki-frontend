import Anime from "@/pages/anime/Anime";
import Home from "@/pages/Home";
import LoginPage from "@/pages/user/login";

export const appRoutes = [
    {
        path: "/*",
        element: <Home/>,
    },
    {
        path: "/anime",
        element: <Anime/>
    },
    {
        path: "/login",
        element: <LoginPage/>
    }
]