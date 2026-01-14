import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const from =
        (location.state as { from?: string } | undefined)?.from ??
        (document.referrer && new URL(document.referrer).origin === window.location.origin
            ? document.referrer.replace(window.location.origin, '')
            : undefined) ??
        '/';

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(from || '/', { replace: true });
        }
    };

  return (
    <div className="flex flex-1 min-h-0 w-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found</p>
        <Link to={from} onClick={handleBack} className="mt-4 inline-block text-chart-1">
            Back to previous page
        </Link>
      </div>
    </div>
  );
}
