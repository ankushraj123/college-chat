import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import LandingPage from "@/pages/landing";
import ChatPage from "@/pages/chat";
import AdminPage from "@/pages/admin";
import VipPage from "@/pages/vip";
import NotFound from "@/pages/not-found";
import { ChiefLoginPage } from "@/pages/chief-login";
import { ChiefDashboardPage } from "@/pages/chief-dashboard";
import { CollegeAdminDashboardPage } from "@/pages/college-admin-dashboard";
import { NormalAdminDashboardPage } from "@/pages/normal-admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/vip" component={VipPage} />
      <Route path="/chief-login" component={ChiefLoginPage} />
      <Route path="/chief-dashboard" component={ChiefDashboardPage} />
      <Route path="/college-admin-dashboard" component={CollegeAdminDashboardPage} />
      <Route path="/normal-admin-dashboard" component={NormalAdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;