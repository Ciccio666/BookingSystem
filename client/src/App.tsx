import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/layout/Navigation";

// Lazy load pages for better performance
const ServicePage = lazy(() => import("@/pages/ServicePage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const MessagingPage = lazy(() => import("@/pages/MessagingPage"));
const AIChatPage = lazy(() => import("@/pages/AIChatPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[80vh]">
    <Loader2 className="h-12 w-12 text-primary animate-spin" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={ServicePage} />
        <Route path="/services" component={ServicePage} />
        <Route path="/bookings" component={BookingPage} />
        <Route path="/bookings/:id" component={BookingPage} />
        <Route path="/messaging" component={MessagingPage} />
        <Route path="/ai-chat" component={AIChatPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <div className="bg-neutral-100 min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Router />
      </main>
    </div>
  );
}

export default App;
