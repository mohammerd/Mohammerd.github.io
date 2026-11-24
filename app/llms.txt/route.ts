import type { Metadata } from 'next';

import { projects } from '@/data/projects';
import routes from '@/data/routes';
import { RESUME_JSON_URL } from '@/lib/resumeJson';
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/utils';
import { getWritingItems } from '@/lib/writing';
import { metadata as about } from '../about/page';
import { metadata as contact } from '../contact/page';
import { metadata as play } from '../play/page';
import { metadata as projectIndex } from '../projects/page';
import { metadata as resume } from '../resume/page';
import { metadata as writing } from '../writing/page';

export const dynamic = 'force-static';

const PAGES: Record<string, Metadata> = {
  '/about': about,
  '/contact': contact,
  '/play': play,
  '/projects': projectIndex,
  '/resume': resume,
  '/writing': writing,
};

function linkText(text: string): string {
  return text.replaceAll('[', '\\[').replaceAll(']', '\\]');
}

function entry(title: string, url: string, description?: string | null) {
  const note = description?.replace(/\s+/g, ' ').trim();
  return '- [' + linkText(title) + '](' + url + ')' + (note ? ': ' + note : '');
}

export function GET() {
  const pages = routes
    .filter((route) => !route.index)
    .map((route) => {
      const description = PAGES[route.path]?.description;
      if (!description) {
        throw new Error('llms.txt has no description for ' + route.path);
      }
      return entry(route.label, SITE_URL + route.path + '/', description);
    });

  const projectEntries = projects.map((project) =>
    entry(
      project.title,
      SITE_URL + '/projects/' + project.slug + '/',
      project.desc,
    ),
  );

  const items = getWritingItems();
  const posts = items
    .filter((item) => !item.isExternal)
    .map((item) => entry(item.title, SITE_URL + item.url, item.description));
  const elsewhere = items
    .filter((item) => item.isExternal)
    .map((item) => entry(item.title, item.url, item.description));

  const body = [
    '# ' + AUTHOR_NAME,
    '',
    '> ' + SITE_DESCRIPTION,
    '',
    'Every page is static HTML. Project pages describe current research and product work. Writing will be added as original essays, research notes, and project updates.',
    '',
    '## Pages',
    '',
    pages.join('\n'),
    '',
    '## Projects',
    '',
    projectEntries.join('\n'),
    '',
    '## Writing',
    '',
    posts.join('\n'),
    '',
    '## Data',
    '',
    entry(
      'Résumé as JSON Resume',
      RESUME_JSON_URL,
      'The supplied education and contact details in the JSON Resume v1.0.0 schema',
    ),
    entry(
      'RSS feed',
      SITE_URL + '/feed.xml',
      'Original writing when published',
    ),
    entry('Sitemap', SITE_URL + '/sitemap.xml'),
    '',
    '## Optional',
    '',
    elsewhere.join('\n'),
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
