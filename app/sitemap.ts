import type { MetadataRoute } from 'next';

import { projects } from '@/data/projects';
import routes from '@/data/routes';
import { getAllPosts } from '@/lib/posts';
import { canonicalPostUrl, SITE_URL } from '@/lib/utils';

export const dynamic = 'force-static';

type CrawlHints = Pick<
  MetadataRoute.Sitemap[number],
  'changeFrequency' | 'priority'
>;

const CRAWL_HINTS: Record<string, CrawlHints> = {
  '/': { priority: 1 },
  '/projects': { changeFrequency: 'monthly', priority: 0.9 },
  '/play': { changeFrequency: 'monthly', priority: 0.6 },
  '/writing': { changeFrequency: 'weekly' },
  '/contact': { changeFrequency: 'yearly', priority: 0.5 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = routes.map(({ path }) => ({
    url: `${SITE_URL}${path.endsWith('/') ? path : `${path}/`}`,
    changeFrequency: 'monthly',
    priority: 0.8,
    ...CRAWL_HINTS[path],
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}/`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: canonicalPostUrl(post.slug),
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...pages, ...projectPages, ...posts];
}
