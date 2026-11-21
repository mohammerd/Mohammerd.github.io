import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Footer from '@/components/Template/Footer';
import profile from '@/data/profile.json';
import work from '@/data/resume/work';
import { buildJsonResume } from '@/lib/resumeJson';
import { personNode } from '@/lib/schema';

describe('published personal profile', () => {
  it('uses the supplied student and researcher role', () => {
    expect(profile.role).toBe('Student & independent AI safety researcher');
  });

  it('does not publish employment that has not been supplied', () => {
    expect(work).toEqual([]);
    expect(buildJsonResume().work).toEqual([]);
  });

  it('does not claim an employer or job title in structured data', () => {
    const person = personNode();

    expect(person).not.toHaveProperty('jobTitle');
    expect(person).not.toHaveProperty('worksFor');
  });

  it('does not display a fabricated current role in the footer', () => {
    const { container } = render(<Footer />);

    expect(container.querySelector('.footer-role')).toBeNull();
    expect(container).toHaveTextContent('Muhammad Zakari');
  });
});
