import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, MapPin, Phone, MessageCircle, Clock, CheckCircle, Share2, ChevronRight, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const allServices = [
  { id: 1, name: "Dog Grooming", provider: "PawSpa", price: "From $35", rating: 4.9, reviews: 312, location: "2.1 mi", icon: "🛁", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=400&fit=crop", description: "Full grooming service including bath, haircut, nail trimming, and ear cleaning. We use premium, pet-safe products for a shiny and healthy coat.", hours: "Mon-Sat: 9AM - 6PM", phone: "(555) 123-4567", address: "123 Pet Lane, Pawsville", features: ["Bath & Blow Dry", "Haircut & Styling", "Nail Trimming", "Ear Cleaning", "Teeth Brushing"], providerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop", providerBio: "Professional pet grooming with 10+ years experience. We treat every pet like family." },
  { id: 2, name: "Pet Sitting", provider: "PetWatch", price: "From $25/day", rating: 4.7, reviews: 189, location: "1.5 mi", icon: "🏠", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop", description: "Reliable, loving pet sitting in a home environment. Daily updates with photos and videos so you never miss a moment.", hours: "Available 24/7", phone: "(555) 234-5678", address: "456 Companion Ave", features: ["In-Home Care", "Daily Photo Updates", "Feeding & Medication", "Walks Included", "Overnight Stays"], providerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", providerBio: "Certified pet sitter with a passion for animals. Your pet's comfort is our priority." },
  { id: 3, name: "Vet Checkup", provider: "Dr. Sarah's Clinic", price: "From $50", rating: 4.8, reviews: 456, location: "3.0 mi", icon: "🩺", image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=400&fit=crop", description: "Comprehensive veterinary checkups including physical examination, vaccinations, blood work, and health consultations.", hours: "Mon-Fri: 8AM - 7PM, Sat: 9AM - 3PM", phone: "(555) 345-6789", address: "789 Health Blvd", features: ["Physical Examination", "Vaccinations", "Blood Work", "Dental Check", "Nutrition Advice"], providerAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop", providerBio: "Licensed veterinarian with specialization in small animal care. 15 years of practice." },
  { id: 4, name: "Dog Training", provider: "K9 Academy", price: "From $40/session", rating: 4.6, reviews: 98, location: "4.2 mi", icon: "🎓", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop", description: "Professional dog training using positive reinforcement methods. From basic obedience to advanced tricks.", hours: "Tue-Sun: 8AM - 5PM", phone: "(555) 456-7890", address: "321 Training Way", features: ["Basic Obedience", "Behavioral Correction", "Puppy Classes", "Advanced Tricks", "Agility Training"], providerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", providerBio: "Certified dog trainer with expertise in positive reinforcement techniques." },
  { id: 5, name: "Pet Photography", provider: "PawShots", price: "From $75", rating: 4.9, reviews: 67, location: "5.0 mi", icon: "📸", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop", description: "Professional pet photography sessions in studio or outdoor locations. High-quality prints and digital files included.", hours: "By Appointment", phone: "(555) 567-8901", address: "654 Snapshot Rd", features: ["Studio Sessions", "Outdoor Shoots", "Digital Files", "Printed Albums", "Pet & Owner Portraits"], providerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", providerBio: "Award-winning pet photographer capturing the personality of your beloved companions." },
  { id: 6, name: "Horse Boarding", provider: "Green Pastures", price: "From $300/mo", rating: 4.5, reviews: 34, location: "8.5 mi", icon: "🐴", image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=400&fit=crop", description: "Full-service horse boarding with spacious pastures, clean stalls, daily turnout, and experienced staff.", hours: "Daily: 6AM - 8PM", phone: "(555) 678-9012", address: "999 Ranch Rd", features: ["Spacious Stalls", "Daily Turnout", "Feed Included", "Riding Arena", "Trail Access"], providerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", providerBio: "Family-owned boarding facility on 50 acres of beautiful countryside." },
];

const reviewsData = [
  { id: 1, user: "Emily R.", rating: 5, text: "Amazing service! My dog came back looking and smelling wonderful. Highly recommend!", time: "3 days ago" },
  { id: 2, user: "James P.", rating: 5, text: "Very professional and caring staff. Will definitely come back.", time: "1 week ago" },
  { id: 3, user: "Anna W.", rating: 4, text: "Great experience overall. Slightly long wait time but quality was excellent.", time: "2 weeks ago" },
];

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const service = allServices.find((s) => s.id === Number(serviceId));

  if (!service) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Service not found</p>
          <button onClick={() => navigate("/marketplace")} className="mt-3 text-primary text-sm">Back to Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold truncate mx-4">Service Details</h1>
          <button onClick={() => setLiked(!liked)} className="p-1.5 rounded-full hover:bg-secondary">
            <Heart className={`w-5 h-5 ${liked ? "fill-[hsl(var(--like))] text-[hsl(var(--like))]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative">
        <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium">{service.location}</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{service.icon}</span>
            <h2 className="text-xl font-bold">{service.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{service.provider}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{service.rating}</span>
              <span className="text-sm text-muted-foreground">({service.reviews})</span>
            </div>
            <span className="text-lg font-bold text-primary">{service.price}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-card border border-border">
            <Clock className="w-4 h-4 text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground">Hours</p>
            <p className="text-xs font-medium mt-0.5">{service.hours}</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <MapPin className="w-4 h-4 text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground">Address</p>
            <p className="text-xs font-medium mt-0.5">{service.address}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold mb-1">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold mb-2">What's Included</h3>
          <div className="space-y-2">
            {service.features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Provider */}
        <button onClick={() => {}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
          <img src={service.providerAvatar} alt={service.provider} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">{service.provider}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{service.providerBio}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Reviews */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Reviews</h3>
          <div className="space-y-3">
            {reviewsData.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.user}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{r.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{r.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 lg:bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href={`tel:${service.phone}`} className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <Phone className="w-5 h-5" />
          </a>
          <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            <Calendar className="w-4 h-4" />
            Book Now
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServiceDetail;
