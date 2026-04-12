import { useMemo } from "react";
import { getBookings, getBookingStatus } from "@/lib/bookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, IndianRupee, BookOpen, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, isWithinInterval, addDays, startOfDay, endOfDay, parseISO } from "date-fns";

export default function Dashboard() {
  const bookings = useMemo(() => getBookings(), []);

  const today = new Date();
  const todayBookings = bookings.filter((b) => {
    const from = new Date(b.fromDateTime);
    return format(from, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  });

  const upcoming7 = bookings.filter((b) => {
    const from = new Date(b.fromDateTime);
    return from > today && from <= addDays(today, 7);
  });

  const upcoming30 = bookings.filter((b) => {
    const from = new Date(b.fromDateTime);
    return from > today && from <= addDays(today, 30);
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.utilityCharges || 0), 0);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    bookings.forEach((b) => {
      const key = format(new Date(b.fromDateTime), "MMM yyyy");
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [bookings]);

  // Calendar: booked dates
  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      const from = new Date(b.fromDateTime);
      const to = new Date(b.toDateTime);
      let d = startOfDay(from);
      while (d <= endOfDay(to)) {
        set.add(format(d, "yyyy-MM-dd"));
        d = addDays(d, 1);
      }
    });
    return set;
  }, [bookings]);

  const widgets = [
    { label: "Total Bookings", value: bookings.length, icon: BookOpen, color: "bg-primary" },
    { label: "Today's Bookings", value: todayBookings.length, icon: CalendarDays, color: "bg-info" },
    { label: "Upcoming (7 days)", value: upcoming7.length, icon: Clock, color: "bg-warning" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-success" },
  ];

  // Simple month calendar
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="rounded-lg overflow-hidden shadow-md">
        <img
          src="/images/adigoud-banner.jpg"
          alt="Adi Goud Bhawan Banner"
          className="w-full h-auto object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <Card key={w.label} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${w.color} p-3 rounded-lg text-primary-foreground`}>
                <w.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{w.label}</p>
                <p className="text-2xl font-bold">{w.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Bookings Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No bookings yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(215 80% 28%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{format(today, "MMMM yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="font-semibold text-muted-foreground py-1">{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />;
                const dateStr = format(new Date(currentYear, currentMonth, day), "yyyy-MM-dd");
                const isBooked = bookedDates.has(dateStr);
                const isToday = day === today.getDate();
                return (
                  <div
                    key={i}
                    className={`py-1.5 rounded text-xs font-medium ${
                      isBooked ? "bg-primary text-primary-foreground" : ""
                    } ${isToday && !isBooked ? "ring-1 ring-primary" : ""}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-primary" /> Booked
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
