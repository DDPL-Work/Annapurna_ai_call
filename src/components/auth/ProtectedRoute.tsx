import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectIsInitializing,
  fetchMe,
} from "../../store/authSlice";
import type { AppDispatch } from "../../store/store";
import { getAccessToken } from "../../lib/api/client";

export default function ProtectedRoute() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);

  useEffect(() => {
    if (isInitializing && getAccessToken()) {
      // On a browser refresh, hydrate the persisted session before deciding
      // whether this route is protected. Login already fetches /me itself.
      dispatch(fetchMe());
    }
  }, [dispatch, isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
