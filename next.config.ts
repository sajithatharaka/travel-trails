import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      // Supabase Storage public bucket (media). Host resolved from the env var
      // at build time; the wildcard covers local dev / preview projects.
      { protocol: "https", hostname: supabaseHost ?? "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
