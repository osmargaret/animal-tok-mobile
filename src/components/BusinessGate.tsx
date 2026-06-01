import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wrap personal-only pages so that business accounts are redirected
 * to their dashboard. Keeps the business experience strictly about
 * products, sales, services, events and ads.
 */
const BusinessGate = ({ children }: { children: React.ReactNode }) => {
  const { accountType, isAuthenticated } = useAuth();
  if (isAuthenticated && accountType === "business") {
    return <Navigate to="/business/dashboard" replace />;
  }
  return <>{children}</>;
};

export default BusinessGate;
