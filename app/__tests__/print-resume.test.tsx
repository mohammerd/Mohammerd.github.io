import { describe, expect, it } from 'vitest';

import degrees from '@/data/resume/degrees';
import work from '@/data/resume/work';
import courses from '@/data/resume/courses';

describe('published education and experience data', () => {
  it('lists the current KSITM programme without inventing a graduation year', () => {
    expect(degrees).toEqual([
      {
        school: 'Katsina State Institute of Technology and Management (KSITM)',
        degree: 'Computer Software Engineering',
        current: true,
      },
    ]);
    expect(degrees[0].year).toBeUndefined();
  });

  it('does not publish employment or coursework that has not been supplied', () => {
    expect(work).toEqual([]);
    expect(courses).toEqual([]);
  });
});
