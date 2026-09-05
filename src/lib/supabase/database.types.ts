/**
 * Hand-maintained until the Supabase project exists and we can run
 * `supabase gen types typescript`. Keep in sync with supabase/migrations/*.
 */
export type Role = "admin" | "tour_designer";
export type TourStatusFilter = "pending" | "confirmed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          role: Role;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          role?: Role;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tours: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title: string;
          summary: string;
          hero_eyebrow: string | null;
          hero_headline: string;
          hero_subheadline: string | null;
          duration_days: number | null;
          destination_count: number | null;
          price_from_usd: number | null;
          cover_image_url: string | null;
          route_map_image_url: string | null;
          is_published: boolean;
          is_featured: boolean;
          display_order: number;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug: string;
          title: string;
          summary?: string;
          hero_eyebrow?: string | null;
          hero_headline: string;
          hero_subheadline?: string | null;
          duration_days?: number | null;
          destination_count?: number | null;
          price_from_usd?: number | null;
          cover_image_url?: string | null;
          route_map_image_url?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          display_order?: number;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tours"]["Insert"]>;
        Relationships: [];
      };
      tour_days: {
        Row: {
          id: string;
          tour_id: string;
          created_at: string;
          day_label: string;
          title: string;
          description: string;
          experiences_label: string | null;
          experiences: string[];
          note: string | null;
          image_url: string | null;
          anchor: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          tour_id: string;
          created_at?: string;
          day_label: string;
          title: string;
          description?: string;
          experiences_label?: string | null;
          experiences?: string[];
          note?: string | null;
          image_url?: string | null;
          anchor?: string | null;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["tour_days"]["Insert"]>;
        Relationships: [];
      };
      tour_route_stops: {
        Row: {
          id: string;
          tour_id: string;
          created_at: string;
          num: number;
          name: string;
          description: string | null;
          anchor: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          tour_id: string;
          created_at?: string;
          num: number;
          name: string;
          description?: string | null;
          anchor?: string | null;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["tour_route_stops"]["Insert"]>;
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          created_at: string;
          tour_id: string | null;
          tour_slug: string | null;
          tour_title: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          travel_date: string | null;
          travellers: number | null;
          adults: number;
          children: number;
          message: string | null;
          status: "pending" | "confirmed" | "cancelled";
          handled_by: string | null;
          handled_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          tour_id?: string | null;
          tour_slug?: string | null;
          tour_title?: string | null;
          first_name: string;
          last_name?: string;
          email: string;
          phone?: string | null;
          travel_date?: string | null;
          travellers?: number | null;
          adults?: number;
          children?: number;
          message?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          handled_by?: string | null;
          handled_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["booking_requests"]["Insert"]
        >;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject?: string;
          message: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["contact_submissions"]["Insert"]
        >;
        Relationships: [];
      };
      notification_recipients: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          is_active: boolean;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["notification_recipients"]["Insert"]
        >;
        Relationships: [];
      };
      notification_dispatch_logs: {
        Row: {
          id: string;
          created_at: string;
          dedupe_key: string;
          event_type: "new_booking" | "new_inquiry" | "booking_status_changed";
          status: "sent" | "skipped" | "failed";
          details: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          created_at?: string;
          dedupe_key: string;
          event_type: "new_booking" | "new_inquiry" | "booking_status_changed";
          status: "sent" | "skipped" | "failed";
          details?: Record<string, unknown>;
        };
        Update: Partial<
          Database["public"]["Tables"]["notification_dispatch_logs"]["Insert"]
        >;
        Relationships: [];
      };
      blogs: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          category: string;
          published_date: string;
          image_url: string | null;
          is_published: boolean;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug: string;
          title: string;
          excerpt?: string;
          content?: string;
          category?: string;
          published_date?: string;
          image_url?: string | null;
          is_published?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blogs"]["Insert"]>;
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          created_at: string;
          question: string;
          answer: string;
          category: string;
          tour_id: string | null;
          display_order: number;
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          question: string;
          answer: string;
          category?: string;
          tour_id?: string | null;
          display_order?: number;
          is_visible?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["faqs"]["Insert"]>;
        Relationships: [];
      };
      gallery: {
        Row: {
          id: string;
          created_at: string;
          alt_text: string;
          category: string;
          image_url: string | null;
          tour_id: string | null;
          display_order: number;
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          alt_text?: string;
          category?: string;
          image_url?: string | null;
          tour_id?: string | null;
          display_order?: number;
          is_visible?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["gallery"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          created_at: string;
          reviewer_name: string;
          rating: number;
          review_text: string;
          source: string;
          location: string | null;
          is_visible: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          reviewer_name: string;
          rating?: number;
          review_text: string;
          source?: string;
          location?: string | null;
          is_visible?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      welcome_sections: {
        Row: {
          id: string;
          created_at: string;
          badge_text: string;
          heading: string;
          paragraph_1: string;
          paragraph_2: string;
          image_1_url: string | null;
          image_1_alt: string;
          image_2_url: string | null;
          image_2_alt: string;
          image_3_url: string | null;
          image_3_alt: string;
          image_4_url: string | null;
          image_4_alt: string;
          display_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          badge_text?: string;
          heading: string;
          paragraph_1?: string;
          paragraph_2?: string;
          image_1_url?: string | null;
          image_1_alt?: string;
          image_2_url?: string | null;
          image_2_alt?: string;
          image_3_url?: string | null;
          image_3_alt?: string;
          image_4_url?: string | null;
          image_4_alt?: string;
          display_order?: number;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["welcome_sections"]["Insert"]
        >;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
        };
        Insert: { key: string; value: unknown; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: Role;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type TourRow = Database["public"]["Tables"]["tours"]["Row"];
export type TourDayRow = Database["public"]["Tables"]["tour_days"]["Row"];
export type TourRouteStopRow = Database["public"]["Tables"]["tour_route_stops"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type BookingRequestRow =
  Database["public"]["Tables"]["booking_requests"]["Row"];
export type ContactSubmissionRow =
  Database["public"]["Tables"]["contact_submissions"]["Row"];
export type NotificationRecipientRow =
  Database["public"]["Tables"]["notification_recipients"]["Row"];
export type BookingStatus = BookingRequestRow["status"];
export type BlogRow = Database["public"]["Tables"]["blogs"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type GalleryRow = Database["public"]["Tables"]["gallery"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type WelcomeSectionRow =
  Database["public"]["Tables"]["welcome_sections"]["Row"];
