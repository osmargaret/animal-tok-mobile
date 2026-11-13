export interface ProductItem {
  id: string;
  name: string;
  price: string;
  rating: string;
  seller: string;
  image: string;
  category: string;
  description?: string;
  sellerId?: string;
  inStock?: boolean;
  types?: string[]; // e.g. ["Standard", "Organic", "Grain-Free"]
  sizes?: string[]; // e.g. ["300g", "1kg", "5kg", "300kg"]
  colors?: string[]; // e.g. ["Blue", "Black", "Natural", "Red"]
  fulfillment?: "delivery" | "pickup" | "both";
  pickupAddress?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  rating: string;
  provider: string;
  image: string;
  category?: string;
  description?: string;
  availability?: string; // e.g. "Monday to Friday, 9:00 AM – 10:00 PM"
  locationName?: string;
  locationAddress?: string;
  mode?: "onsite" | "virtual" | "both";
  providerId?: string;
}

export const marketProducts: ProductItem[] = [
  {
    id: "p1",
    name: "Organic Salmon Treats",
    price: "$14.99",
    rating: "4.9",
    seller: "Pawsome Gourmet",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&fit=crop",
    category: "Food & Treats",
  },
  {
    id: "p2",
    name: "GPS Smart Pet Collar",
    price: "$59.99",
    rating: "4.8",
    seller: "TechPaws",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&fit=crop",
    category: "Accessories",
  },
  {
    id: "p3",
    name: "Interactive Feather Wand",
    price: "$9.99",
    rating: "5.0",
    seller: "Feline Fun Co.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&fit=crop",
    category: "Toys",
  },
  {
    id: "p4",
    name: "Cozy Memory Foam Bed",
    price: "$45.00",
    rating: "4.7",
    seller: "ComfortPets",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&fit=crop",
    category: "Beds & Furniture",
  },
];

export const marketServices: ServiceItem[] = [
  {
    id: "s1",
    name: "Mobile Spa & Grooming",
    price: "$50.00",
    rating: "5.0",
    provider: "Bark & Shine Spa",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&fit=crop",
    category: "Grooming",
    description: "Complete full-body luxury bath, shedding blow-out, paw massage, nail trimming, and ear cleaning in our sanitized mobile van.",
    availability: "Monday to Friday, 9:00 AM – 8:00 PM",
    locationName: "Bark & Shine Mobile Station",
    locationAddress: "1204 Zilker Park Blvd, Austin, TX",
    mode: "onsite",
  },
  {
    id: "s2",
    name: "Positive Puppy Training 101",
    price: "$80.00",
    rating: "4.9",
    provider: "Canine Academy",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&fit=crop",
    category: "Training",
    description: "Private one-on-one positive reinforcement obedience session covering leash walking, recall, crate training, and impulse control.",
    availability: "Monday to Saturday, 10:00 AM – 6:00 PM",
    locationName: "Canine Academy Center",
    locationAddress: "742 Evergreen Terrace, Austin, TX",
    mode: "both",
  },
];
