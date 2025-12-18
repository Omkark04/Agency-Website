// frontend/src/api/offers.ts
import api from "./api";

/* ---------- Types ---------- */
export type Offer = {
  id: number;
  title: string;
  slug?: string;
  short_description?: string;
  description?: string;
  image?: string | null;
  imageURL?: string | null;  // Cloudinary image URL
  offer_type?: string;
  offer_category?: "regular" | "special";
  services?: Array<{ id: number; title: string; slug?: string }>;
  original_price?: number | null;
  discounted_price?: number | null;
  discount_type?: "percent" | "flat";
  discount_value?: number;
  discount_percentage?: number;
  discount_code?: string;
  valid_from?: string | null;
  valid_to?: string | null;
  remaining_days?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  is_limited_time?: boolean;
  is_approved?: boolean;
  features?: string[];
  conditions?: string[];
  cta_text?: string;
  cta_link?: string;
  created_at?: string;
  updated_at?: string;
};

/* ---------- PUBLIC API ---------- */

export const listOffers = (params?: Record<string, any>) =>
  api.get("/api/offers/", { params });

export const getOffer = (id: number) =>
  api.get(`/api/offers/${id}/`);

export const getCurrentDeal = () =>
  api.get("/api/offers/current-deal/");

export const getOfferStats = () =>
  api.get("/api/offers/stats/");

/* ---------- ADMIN API (ALWAYS SEND FORMDATA) ---------- */

export function createOffer(formData: FormData) {
  return api.post("/api/offers/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function updateOffer(id: number, formData: FormData) {
  return api.put(`/api/offers/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export const deleteOffer = (id: number) =>
  api.delete(`/api/offers/${id}/`);

export const approveOffer = (id: number) =>
  api.post(`/api/offers/${id}/approve/`);
