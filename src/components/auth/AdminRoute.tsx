import { useSelector } from "react-redux";
import { Link, Navigate, Outlet } from "react-router-dom";
import { selectIsAuthenticated } from "../../store/authSlice";
import { selectIsAdmin } from "../../store/authSlice";

export default function AdminRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="card max-w-md p-6 text-center">
          <h1 className="font-display text-xl text-ink">Access denied</h1>
          <p className="mt-2 text-sm text-muted">
            Your account does not have permission to view this page.
          </p>
          <Link to="/dashboard" className="btn-primary mt-5">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
