import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Clock, Users, Filter, Plus, ChevronRight } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

interface PetEvent {
  id: number;
  title: string;
  type: "meetup" | "show" | "adoption" | "training";
  date: Date;
  time: string;
  location: string;
  distance: string;
  attendees: number;
  maxAttendees: number;
  emoji: string;
  description: string;
  going: boolean;
}

const today = new Date();

const initialEvents: PetEvent[] = [
  { id: 1, title: "Dog Park Meetup", type: "meetup", date: today, time: "10:00 AM", location: "Central Dog Park", distance: "0.8 mi", attendees: 24, maxAttendees: 50, emoji: "🐕", description: "Bring your pups for a fun morning at the park!", going: true },
  { id: 2, title: "Cat Adoption Fair", type: "adoption", date: today, time: "2:00 PM", location: "City Animal Shelter", distance: "2.3 mi", attendees: 45, maxAttendees: 100, emoji: "🐈", description: "Find your new furry companion.", going: false },
  { id: 3, title: "Exotic Bird Show", type: "show", date: addDays(today, 1), time: "11:00 AM", location: "Convention Center", distance: "5.1 mi", attendees: 120, maxAttendees: 300, emoji: "🦜", description: "Annual exotic bird exhibition with prizes.", going: false },
  { id: 4, title: "Puppy Training Workshop", type: "training", date: addDays(today, 2), time: "9:00 AM", location: "PetSmart Training Room", distance: "1.5 mi", attendees: 8, maxAttendees: 15, emoji: "🎓", description: "Basic obedience for puppies under 1 year.", going: true },
  { id: 5, title: "Horse & Pony Day", type: "show", date: addDays(today, 3), time: "8:00 AM", location: "Greenfield Stables", distance: "12 mi", attendees: 67, maxAttendees: 200, emoji: "🐴", description: "Meet local horses and enjoy pony rides.", going: false },
  { id: 6, title: "Reptile Lovers Meetup", type: "meetup", date: addDays(today, 5), time: "3:00 PM", location: "Herp Society Hall", distance: "4.2 mi", attendees: 15, maxAttendees: 30, emoji: "🦎", description: "Share tips and show off your scaly friends.", going: false },
];

const typeColors: Record<string, string> = {
  meetup: "bg-primary/20 text-primary",
  show: "bg-amber-500/20 text-amber-400",
  adoption: "bg-pink-500/20 text-pink-400",
  training: "bg-violet-500/20 text-violet-400",
};

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = ["all", "meetup", "show", "adoption", "training"];

  const filteredEvents = events.filter((e) => {
    const matchesFilter = activeFilter === "all" || e.type === activeFilter;
    const matchesDate = !selectedDate || isSameDay(e.date, selectedDate);
    return matchesFilter && matchesDate;
  });

  const toggleGoing = (id: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, going: !e.going, attendees: e.going ? e.attendees - 1 : e.attendees + 1 } : e
      )
    );
  };

  const eventDates = events.map((e) => e.date);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Events</h1>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("p-3 pointer-events-auto")}
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{ hasEvent: "bg-primary/20 font-bold" }}
              />
              {selectedDate && (
                <div className="px-3 pb-3">
                  <button onClick={() => setSelectedDate(undefined)} className="text-xs text-primary w-full text-center">
                    Clear date filter
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors",
                activeFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {f === "all" ? "All Events" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {selectedDate && (
          <p className="text-xs text-muted-foreground">
            Showing events for {format(selectedDate, "MMMM d, yyyy")}
          </p>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm text-muted-foreground">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-xl">
                    {event.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{event.title}</h3>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", typeColors[event.type])}>
                      {event.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleGoing(event.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    event.going ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-border"
                  )}
                >
                  {event.going ? "Going ✓" : "Join"}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">{event.description}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {format(event.date, "MMM d")}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location} · {event.distance}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendees}/{event.maxAttendees}</span>
              </div>

              {/* Attendance bar */}
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Events;
