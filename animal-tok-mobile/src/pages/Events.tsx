import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Clock, Users, Plus, X, ChevronRight } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface PetEvent {
  id: number;
  title: string;
  type: "meetup" | "show" | "adoption" | "training" | "mating" | "sports";
  date: Date;
  time: string;
  location: string;
  distance: string;
  attendees: number;
  maxAttendees: number;
  emoji: string;
  description: string;
  going: boolean;
  createdByMe: boolean;
}

const today = new Date();

const initialEvents: PetEvent[] = [
  { id: 1, title: "Dog Park Meetup", type: "meetup", date: today, time: "10:00 AM", location: "Central Dog Park", distance: "0.8 mi", attendees: 24, maxAttendees: 50, emoji: "🐕", description: "Bring your pups for a fun morning at the park!", going: true, createdByMe: false },
  { id: 2, title: "Cat Adoption Fair", type: "adoption", date: today, time: "2:00 PM", location: "City Animal Shelter", distance: "2.3 mi", attendees: 45, maxAttendees: 100, emoji: "🐈", description: "Find your new furry companion.", going: false, createdByMe: false },
  { id: 3, title: "Exotic Bird Show", type: "show", date: addDays(today, 1), time: "11:00 AM", location: "Convention Center", distance: "5.1 mi", attendees: 120, maxAttendees: 300, emoji: "🦜", description: "Annual exotic bird exhibition with prizes.", going: false, createdByMe: false },
  { id: 4, title: "Puppy Training Workshop", type: "training", date: addDays(today, 2), time: "9:00 AM", location: "PetSmart Training Room", distance: "1.5 mi", attendees: 8, maxAttendees: 15, emoji: "🎓", description: "Basic obedience for puppies under 1 year.", going: true, createdByMe: false },
  { id: 5, title: "Horse & Pony Day", type: "show", date: addDays(today, 3), time: "8:00 AM", location: "Greenfield Stables", distance: "12 mi", attendees: 67, maxAttendees: 200, emoji: "🐴", description: "Meet local horses and enjoy pony rides.", going: false, createdByMe: false },
  { id: 6, title: "Reptile Lovers Meetup", type: "meetup", date: addDays(today, 5), time: "3:00 PM", location: "Herp Society Hall", distance: "4.2 mi", attendees: 15, maxAttendees: 30, emoji: "🦎", description: "Share tips and show off your scaly friends.", going: false, createdByMe: false },
];

const typeColors: Record<string, string> = {
  meetup: "bg-primary/20 text-primary",
  show: "bg-amber-500/20 text-amber-400",
  adoption: "bg-pink-500/20 text-pink-400",
  training: "bg-violet-500/20 text-violet-400",
  mating: "bg-rose-500/20 text-rose-400",
  sports: "bg-emerald-500/20 text-emerald-400",
};

const typeEmojis: Record<string, string> = {
  meetup: "🐾",
  show: "🏆",
  adoption: "🏠",
  training: "🎓",
  mating: "💕",
  sports: "⚽",
};

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>("meetup");
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newMaxAttendees, setNewMaxAttendees] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const filters = ["all", "meetup", "show", "adoption", "training", "mating", "sports"];

  const filteredEvents = events.filter((e) => {
    const matchesFilter = activeFilter === "all" || e.type === activeFilter;
    const matchesDate = !selectedDate || isSameDay(e.date, selectedDate);
    const matchesTab = activeTab === "browse" ? !e.createdByMe : e.createdByMe;
    return matchesFilter && matchesDate && matchesTab;
  });

  const myEvents = events.filter((e) => e.createdByMe);

  const toggleGoing = (id: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, going: !e.going, attendees: e.going ? e.attendees - 1 : e.attendees + 1 } : e
      )
    );
  };

  const resetForm = () => {
    setNewTitle("");
    setNewType("meetup");
    setNewDate(undefined);
    setNewTime("");
    setNewLocation("");
    setNewMaxAttendees("");
    setNewDescription("");
  };

  const handleCreateEvent = () => {
    if (!newTitle || !newDate || !newTime || !newLocation) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newEvent: PetEvent = {
      id: Date.now(),
      title: newTitle,
      type: newType as PetEvent["type"],
      date: newDate,
      time: newTime,
      location: newLocation,
      distance: "Nearby",
      attendees: 0,
      maxAttendees: parseInt(newMaxAttendees) || 50,
      emoji: typeEmojis[newType] || "📅",
      description: newDescription || "No description provided.",
      going: true,
      createdByMe: true,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setShowCreateModal(false);
    resetForm();
    setActiveTab("my");
    toast.success("🎉 Your event has been created!", {
      description: "You'll be able to see who's planning to attend.",
    });
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
          <div className="flex items-center gap-2">
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
        </div>

        {/* Tabs: Browse / My Events */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-3">
          <button
            onClick={() => setActiveTab("browse")}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-semibold transition-colors",
              activeTab === "browse" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Browse Events
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-semibold transition-colors",
              activeTab === "my" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            My Events
          </button>
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

        {/* My Events empty state */}
        {activeTab === "my" && myEvents.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-4xl">📅</p>
            <p className="text-sm text-muted-foreground">You haven't created any events yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Would you like to create an event now?
            </button>
          </div>
        )}

        {/* My Events with existing events — show Add Event button */}
        {activeTab === "my" && myEvents.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 border border-dashed border-primary/30 rounded-xl text-sm font-semibold text-primary"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}

        {/* Browse empty */}
        {activeTab === "browse" && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm text-muted-foreground">No events found</p>
          </div>
        )}

        {/* Event cards */}
        {filteredEvents.map((event) => (
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
              {event.createdByMe ? (
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Your Event</span>
              ) : (
                <button
                  onClick={() => toggleGoing(event.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    event.going ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-border"
                  )}
                >
                  {event.going ? "Going ✓" : "Join"}
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{event.description}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {format(event.date, "MMM d")}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location} · {event.distance}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendees}/{event.maxAttendees} attending</span>
            </div>

            {/* Attendance bar */}
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* FAB for browse tab */}
      {activeTab === "browse" && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-24 right-4 lg:bottom-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="fixed inset-x-3 bottom-0 top-16 z-50 bg-card border border-border rounded-t-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Create Event</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Event Title *</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Dog Park Meetup"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Event Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {["meetup", "show", "adoption", "training", "mating", "sports"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
                          newType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {typeEmojis[t]} {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-left flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        {newDate ? format(newDate, "MMMM d, yyyy") : <span className="text-muted-foreground">Pick a date</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newDate}
                        onSelect={setNewDate}
                        disabled={(date) => date < new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Time *</label>
                  <input
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Central Dog Park"
                      className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Max Attendees */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Attendees</label>
                  <input
                    value={newMaxAttendees}
                    onChange={(e) => setNewMaxAttendees(e.target.value)}
                    placeholder="50"
                    type="number"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Tell people what this event is about..."
                    rows={3}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleCreateEvent}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
                >
                  Create Event
                </button>

                <div className="h-8" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Events;
