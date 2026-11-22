import { describe, expect, it } from 'vitest';

import { SITE_URL } from '@/lib/utils';

import { GET } from '../route';

describe('feed.xml route', () => {
  // Optional, and the newest item's date cannot say when the feed changed:
  // an edit, or a backdated post published later, leaves it where it was.
  it('states no lastBuildDate', async () => {
    const xml = await (await GET()).text();

    expect(xml).not.toContain('lastBuildDate');
  });

  it('serves RSS XML and links to a browser stylesheet', async () => {
    const response = await GET();
    const xml = await response.text();

    expect(response.headers.get('content-type')).toBe(
      'application/rss+xml; charset=utf-8',
    );
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain(
      `<?xml-stylesheet type="text/xsl" href="${SITE_URL}/feed.xsl"?>`,
    );
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
  });
});
