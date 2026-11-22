import type { MetadataRoute } from 'next';
import { getCanonicalSiteUrl } from '@/lib/siteUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getCanonicalSiteUrl();
  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/loy-krathong`,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
  ];
}
