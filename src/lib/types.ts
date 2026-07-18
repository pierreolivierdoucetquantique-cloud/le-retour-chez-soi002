export interface ApiService {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  includes: string[];
  relatedSlugs: string[];
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
}

export interface ApiArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  category: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
}

export interface ApiEvent {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  priceCents: number | null;
}

export interface ApiTestimonial {
  id: string;
  name: string;
  quote: string;
  serviceId: string | null;
}

export interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  priceCents: number;
  type: "physical" | "digital" | "course" | "gift_card";
  stock: number | null;
  isActive: boolean;
}

export interface ApiAppointment {
  id: string;
  userId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  isPaid?: boolean;
}
