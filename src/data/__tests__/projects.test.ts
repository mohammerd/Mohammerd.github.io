import { describe, expect, it } from 'vitest';

import { getProject, projects } from '../projects';

describe('project register', () => {
  it('contains the three selected projects in the intended order', () => {
    expect(projects.map((project) => project.title)).toEqual([
      'AgroGuardAI',
      'Hypervisor-Zero',
      'AgroMind',
    ]);
  });

  it('has unique, URL-safe slugs', () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('gives every project a working external destination and detail sections', () => {
    for (const project of projects) {
      expect(new URL(project.link).protocol).toBe('https:');
      expect(project.desc.length).toBeGreaterThan(30);
      expect(project.sections.length).toBeGreaterThan(0);

      for (const section of project.sections) {
        expect(section.heading.length).toBeGreaterThan(0);
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });

  it('resolves a known project and returns undefined for an unknown slug', () => {
    expect(getProject('agroguardai')?.title).toBe('AgroGuardAI');
    expect(getProject('not-a-project')).toBeUndefined();
  });

  it('keeps research-stage claims distinct from production claims', () => {
    expect(getProject('agroguardai')?.stage).toMatch(/early research/i);
    expect(getProject('hypervisor-zero')?.stage).toMatch(/prototype/i);
    expect(getProject('agromind')?.stage).toMatch(/development direction/i);
  });
});
