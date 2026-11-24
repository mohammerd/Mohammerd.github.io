import { describe, expect, it } from 'vitest';

import { AUTHOR_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/utils';
import { metadata as aboutMetadata } from '../about/page';
import { metadata as contactMetadata } from '../contact/page';
import { metadata as playMetadata } from '../play/page';
import { metadata as projectsMetadata } from '../projects/page';
import { metadata as resumeMetadata } from '../resume/page';
import { metadata as writingMetadata } from '../writing/page';

describe('personal-site page metadata', () => {
  it.each([
    ['about', aboutMetadata, '/about/'],
    ['contact', contactMetadata, '/contact/'],
    ['play', playMetadata, '/play/'],
    ['projects', projectsMetadata, '/projects/'],
    ['resume', resumeMetadata, '/resume/'],
    ['writing', writingMetadata, '/writing/'],
  ])(
    '%s uses the personal site identity and canonical URL',
    (_, metadata, path) => {
      const url = SITE_URL + path;

      expect(metadata.alternates?.canonical).toBe(url);
      expect(metadata.openGraph).toMatchObject({
        siteName: AUTHOR_NAME,
        locale: 'en_US',
        url,
        description: metadata.description,
      });
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        site: TWITTER_HANDLE,
        creator: TWITTER_HANDLE,
        description: metadata.description,
      });
      expect(JSON.stringify(metadata.openGraph?.images)).toContain('/og.png');
    },
  );

  it('advertises the RSS feed for future writing', () => {
    expect(writingMetadata.alternates?.types).toEqual({
      'application/rss+xml': '/feed.xml',
    });
  });
});
