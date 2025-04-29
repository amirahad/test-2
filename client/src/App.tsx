import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import TVView from "@/pages/tv-view";
import ReportsPage from "@/pages/reports";
import PropertiesPage from "@/pages/properties";
import AgentsPage from "@/pages/agents";
import SettingsPage from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import SuperAdminAgenciesPage from "@/pages/super-admin/agencies";
import SuperAdminPropertiesPage from "@/pages/super-admin/properties";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SuperAdminRoute } from "@/lib/super-admin-route";

// Root redirect component to avoid hooks rules violation
function RootRedirect() {
  const { user } = useAuth();
  
  // If the user is a super admin, redirect to the agencies page
  if (user?.isSuperAdmin) {
    return <Redirect to="/super-admin/agencies" />;
  }
  // Otherwise, redirect to the regular dashboard
  return <Redirect to="/dashboard" />;
}

// TV Redirect component to avoid hooks rules violation
function TVRedirect() {
  // Using useEffect to handle side effect of location change  
  useEffect(() => {
    window.location.href = "/tv-view";
  }, []);
  
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Redirect root based on user role */}
      <Route path="/">
        <RootRedirect />
      </Route>
      
      {/* Auth page */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Super Admin routes */}
      <SuperAdminRoute path="/super-admin/agencies" component={SuperAdminAgenciesPage} />
      <SuperAdminRoute path="/super-admin/properties" component={SuperAdminPropertiesPage} />
      
      {/* Agency Admin Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/tv-view" component={TVView} />
      <Route path="/tv">
        <TVRedirect />
      </Route>
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/properties" component={PropertiesPage} />
      <ProtectedRoute path="/agents" component={AgentsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
