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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Booking system with sidebar layout */}
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
