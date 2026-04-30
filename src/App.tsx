import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BookingLayout from "@/components/BookingLayout";
import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import Dashboard from "@/pages/Dashboard";
import NewBooking from "@/pages/NewBooking";
import BookingManagement from "@/pages/BookingManagement";
import BookingEdit from "@/pages/BookingEdit";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminOfficeBearers from "@/pages/admin/AdminOfficeBearers";
import AdminTrustCommittee from "@/pages/admin/AdminTrustCommittee";
import AdminTrustDashboard from "@/pages/admin/AdminTrustDashboard";
import AdminTrustList from "@/pages/admin/AdminTrustList";
import AdminTrustEntry from "@/pages/admin/AdminTrustEntry";
import AdminEnquiries from "@/pages/admin/AdminEnquiries";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/office-bearers" element={<AdminOfficeBearers />} />
        <Route path="/admin/trust-committee" element={<AdminTrustCommittee />} />
        <Route path="/admin/trust" element={<AdminTrustDashboard />} />
        <Route path="/admin/trust/list" element={<AdminTrustList />} />
        <Route path="/admin/trust/new" element={<AdminTrustEntry />} />
        <Route path="/admin/trust/edit/:id" element={<AdminTrustEntry />} />
        <Route path="/admin/enquiries" element={<AdminEnquiries />} />

        {/* Booking system - nested routes */}
        <Route path="/booking" element={<BookingLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new" element={<NewBooking />} />
          <Route path="manage" element={<BookingManagement />} />
          <Route path=":id" element={<BookingEdit />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
