import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BookingLayout from "@/components/BookingLayout";
import HomePage from "@/pages/HomePage";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

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

          {/* Booking system */}
          <Route path="/booking/*" element={
            <BookingLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="new" element={<NewBooking />} />
                <Route path="manage" element={<BookingManagement />} />
                <Route path=":id" element={<BookingEdit />} />
              </Routes>
            </BookingLayout>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
