import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../store"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ message: "Please sign in to continue.", from: location }} replace />
  }

  return <>{children}</>
}
