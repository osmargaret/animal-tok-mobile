import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { EngagementProvider } from "@/contexts/EngagementContext";
import CreateAd from "./pages/CreateAd";
import Checkout from "./pages/Checkout";
import Feed from "./pages/Feed";
import Landing from "./pages/Landing";
import HandlerProfile from "./pages/HandlerProfile";
import Inbox from "./pages/Inbox";
import MyStore from "./pages/MyStore";
import CreatePost from "./pages/CreatePost";
import MessageView from "./pages/MessageView";
import Explore from "./pages/Explore";
import Events from "./pages/Events";
import AnimalProfile from "./pages/AnimalProfile";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import ServiceDetail from "./pages/ServiceDetail";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/feed" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <EngagementProvider>
        <MessagingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/login" element={<Landing />} />
            <Route path="/profile" element={<ProtectedRoute><HandlerProfile /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><MyStore /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/create-ad" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/service/:serviceId" element={<ServiceDetail />} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/animal/:animalId" element={<ProtectedRoute><AnimalProfile /></ProtectedRoute>} />
            <Route path="/message/:contactId" element={<ProtectedRoute><MessageView /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </MessagingProvider>
        </EngagementProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
