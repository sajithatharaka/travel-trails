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
