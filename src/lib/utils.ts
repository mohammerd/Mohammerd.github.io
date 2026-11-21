/**
 * Shared utility functions and constants
 */

import profile from '@/data/profile.json';
import packageJson from '../../package.json';
import { parseSiteUrl, prefixBasePath } from './site-url.mjs';

const site = parseSiteUrl(packageJson.homepage);

export const SITE_URL = site.siteUrl;
export const BASE_PATH = site.basePath;

export function withBasePath(path: string): string {
  return prefixBasePath(BASE_PATH, path);
}

export const AUTHOR_NAME = profile.name;
export const TWITTER_HANDLE = '@mohammerdzakari';
export const SITE_IMAGE_PATH = '/images/muhammad-zakari.webp';
export const SITE_IMAGE_DIMENSIONS = {
  width: 384,
  height: 384,
} as const;

export const SITE_DESCRIPTION =
  'Muhammad Zakari is a student and independent AI safety researcher exploring agricultural AI, multilingual systems, and the control of autonomous AI agents.';

export const MAX_COMPETENCY = 5;

export function canonicalPostUrl(slug: string): string {
  return `${SITE_URL}/writing/${slug}/`;
}

export { formatDate, formatMonthYear } from './dates.mjs';
