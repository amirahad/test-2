import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Create separate super admin content component to maintain consistent hook order
function SuperAdminContent({
  Component,
  user,
  isLoading
}: {
  Component: () => React.JSX.Element;
  user: any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Check if user is a super admin
  if (!user.isSuperAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

export function SuperAdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      <SuperAdminContent Component={Component} user={user} isLoading={isLoading} />
    </Route>
  );
}