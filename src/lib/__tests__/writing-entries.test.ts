import { afterEach, expect, it, vi } from 'vitest';

import type { WritingEntry } from '@/data/writing';
import { SITE_URL } from '@/lib/utils';
import { getWritingItems } from '../writing';

const state = vi.hoisted(() => ({
  entries: [] as WritingEntry[],
  posts: [
    {
      slug: 'sample-research-note',
      title: 'Sample research note',
      date: '2026-01-14',
      description: 'A fixture used to verify duplicate writing URLs.',
      content: 'A small test fixture.',
    },
  ],
}));

vi.mock('@/data/writing', () => ({
  get default() {
    return state.entries;
  },
}));

vi.mock('@/lib/posts', () => ({
  getAllPosts() {
    return state.posts;
  },
}));

const entry = (url: string, date = '2026-01-15'): WritingEntry => ({
  title: 'External entry',
  url,
  date,
  description: 'A description.',
});

afterEach(() => {
  state.entries = [];
});

it.each([
  [
    'an impossible date',
    () => [entry('https://a.example/', '2026-02-30')],
    /real YYYY-MM-DD/,
  ],
  [
    'one external address twice',
    () => [
      entry('https://a.example/'),
      entry('https://a.example/', '2025-01-01'),
    ],
    /lists https:\/\/a\.example\/ twice/,
  ],
  [
    'an external entry duplicating an on-site post address',
    () => [entry(SITE_URL + '/writing/sample-research-note/')],
    /lists .*\/writing\/sample-research-note\/ twice/,
  ],
])('stops the build on %s', (_, entries, message) => {
  state.entries = entries();

  expect(() => getWritingItems()).toThrow(message);
});
