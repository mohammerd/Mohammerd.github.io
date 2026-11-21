import { describe, expect, it } from 'vitest';

import { buildJsonResume, toPlainText } from '@/lib/resumeJson';

describe('toPlainText', () => {
  it.each([
    ['one\n    two\n\n  three ', 'one two three'],
    ['see <a href="https://example.com" title="a > b">B</a>', 'see B'],
    ['a note<!-- not for readers --> ends', 'a note ends'],
    ['typed as vector<int> here', 'typed as vector<int> here'],
    ['See [docs](https://example.com).', 'See docs.'],
    ['first  \nsecond', 'first second'],
  ])('flattens Markdown and inline HTML', (input, expected) => {
    expect(toPlainText(input)).toBe(expected);
  });

  it('leaves comparisons and generic type notation alone', () => {
    const text =
      'latency < 50ms and throughput > 1k with Map<string, number>';
    expect(toPlainText(text)).toBe(text);
  });
});

describe('JSON Resume document', () => {
  it('uses the supplied identity, contact details, and current education', () => {
    const resume = buildJsonResume();

    expect(resume.basics).toMatchObject({
      name: 'Muhammad Zakari',
      label: 'Student & independent AI safety researcher',
      email: 'iammohammerd@gmail.com',
    });
    expect(resume.basics).not.toHaveProperty('location');
    expect(resume.basics).not.toHaveProperty('image');
    expect(resume.education).toEqual([
      {
        institution:
          'Katsina State Institute of Technology and Management (KSITM)',
        area: 'Computer Software Engineering',
      },
    ]);
  });

  it('does not invent work history or a skills ranking', () => {
    const resume = buildJsonResume();

    expect(resume.work).toEqual([]);
    expect(resume.skills).toEqual([]);
  });

  it('includes all four supplied professional and social profile links', () => {
    const resume = buildJsonResume();
    const links = resume.basics.profiles.map((item) => item.url);

    expect(links).toContain('https://github.com/mohammerd');
    expect(links).toContain('https://x.com/mohammerdzakari');
    expect(links).toContain('https://www.instagram.com/mohammerdzakari/');
    expect(links).toContain(
      'https://www.linkedin.com/in/muhammad-z-75a73831a',
    );
  });
});
