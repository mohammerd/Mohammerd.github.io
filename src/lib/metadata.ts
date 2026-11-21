import type { Metadata } from 'next';

import profile from '@/data/profile.json';
import { CARD_SIZE, HOME_CARD_PATH } from './share-cards.mjs';
import { AUTHOR_NAME, SITE_URL, TWITTER_HANDLE } from './utils';

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: `/${string}`;
}

const SHARE_IMAGE_ALT = `${AUTHOR_NAME} — ${profile.role}`;

export const sharedOpenGraph: Metadata['openGraph'] = {
  locale: 'en_US',
  siteName: AUTHOR_NAME,
  images: [
    {
      url: HOME_CARD_PATH,
      width: CARD_SIZE.width,
      height: CARD_SIZE.height,
      alt: SHARE_IMAGE_ALT,
    },
  ],
};

export const sharedTwitter: Metadata['twitter'] = {
  card: 'summary_large_image',
  site: TWITTER_HANDLE,
  creator: TWITTER_HANDLE,
  images: [HOME_CARD_PATH],
};

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  const absoluteUrl = path ? `${SITE_URL}${path}` : undefined;
  const pageTitle = `${title} | ${AUTHOR_NAME}`;

  return {
    title,
    description,
    ...(absoluteUrl ? { alternates: { canonical: absoluteUrl } } : {}),
    openGraph: {
      ...sharedOpenGraph,
      type: 'website',
      title: pageTitle,
      description,
      ...(absoluteUrl ? { url: absoluteUrl } : {}),
    },
    twitter: {
      ...sharedTwitter,
      title: pageTitle,
      description,
    },
  };
}
