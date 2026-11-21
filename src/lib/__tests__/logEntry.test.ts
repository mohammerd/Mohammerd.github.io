import { describe, expect, it } from 'vitest';

import { aboutMarkdown } from '@/data/about';
import { extractLogMarker } from '../logEntry';

describe('extractLogMarker', () => {
  it.each([
    ['At 7, I played a lot of video games.', { age: 'Age 7' }],
    ['At 14 - 17, I played a lot of video games.', { age: 'Age 14–17' }],
    ['When I was 12, I played a lot of video games.', { age: 'Age 12' }],
    ['In 2016, I worked on an independent project.', { year: '2016' }],
  ])('extracts only an explicit opening marker: %s', (text, marker) => {
    expect(extractLogMarker(text)).toMatchObject(marker);
  });

  it.each([
    'I still have it. I bought it in 1998.',
    "I've been to approximately 50 countries.",
    'I was 6 months into building a project.',
    'I was 1 of 3 founders on that team.',
    'At 20, ',
  ])('does not invent a marker for: %s', (text) => {
    expect(extractLogMarker(text)).toBeNull();
  });
});

describe('Muhammad’s About page', () => {
  it('uses the supplied education and learning sections, not the template timeline', () => {
    expect(aboutMarkdown).toContain('# Education');
    expect(aboutMarkdown).toContain('# Independent learning');
    expect(aboutMarkdown).not.toContain('# Some history');
  });
});
