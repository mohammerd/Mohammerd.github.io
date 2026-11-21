import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { projects } from '@/data/projects';
import Entry from '../../Projects/Entry';

describe('project entry', () => {
  it('links the full card to its own internal detail page', () => {
    render(<Entry data={projects[0]} />);

    const link = screen.getByRole('link', {
      name: 'Read more about AgroGuardAI',
    });

    expect(link.getAttribute('href')).toMatch(/\/projects\/agroguardai\/?$/);
    expect(link).toHaveTextContent('AgroGuardAI');
    expect(link).toHaveTextContent('Agricultural AI safety research');
    expect(link).toHaveTextContent('Researching how AI systems');
  });

  it('uses each project slug, rather than sending every card to one page', () => {
    const { unmount } = render(
      <>
        {projects.map((project) => (
          <Entry key={project.slug} data={project} />
        ))}
      </>,
    );

    for (const project of projects) {
      const link = screen.getByRole('link', {
        name: 'Read more about ' + project.title,
      });

      expect(link.getAttribute('href')).toMatch(
        new RegExp('/projects/' + project.slug + '/?$'),
      );
    }

    unmount();
  });
});
