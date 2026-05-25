/** @type {import('next').NextConfig} */

function getSupabaseImageRemotePatterns() {
  const patterns = [
    {
      protocol: "https",
      hostname: "cpzkzyokznbrayxnyfin.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const { hostname } = new URL(supabaseUrl);
      if (hostname && !patterns.some((p) => p.hostname === hostname)) {
        patterns.push({
          protocol: "https",
          hostname,
          pathname: "/storage/v1/object/public/**",
        });
      }
    } catch {
      // ignore invalid NEXT_PUBLIC_SUPABASE_URL
    }
  }

  return patterns;
}

const nextConfig = {
  async redirects() {
    return [
      {
        source: "/client/:path*",
        destination: "/student/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: getSupabaseImageRemotePatterns(),
  },
};

export default nextConfig;
