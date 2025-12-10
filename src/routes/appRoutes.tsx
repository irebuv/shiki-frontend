import Home from "@/pages/home";
import LoginPage from "@/pages/user/login";

export const appRoutes = [
    {
        path: "/*",
        element: <Home/>,
    },
    {
        path: "/login",
        element: <LoginPage/>
    }
]