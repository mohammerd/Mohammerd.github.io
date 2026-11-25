import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '../page';

describe('homepage', () => {
  it('introduces Muhammad and shows the three current projects', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Muhammad Zakari' }),
    ).toBeInTheDocument();

    for (const name of ['AgroGuardAI', 'Hypervisor-Zero', 'AgroMind']) {
      expect(
        screen.getByRole('link', { name: 'Read more about ' + name }),
      ).toBeInTheDocument();
    }
  });

  it('embeds the playable AgroGuardAI farm and keeps its dedicated page', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'AgroGuardAI' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'AgroGuardAI farm simulator' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Dig Plot 6/ }),
    ).toBeEnabled();
    expect(
      screen.getByRole('link', { name: /Game details/ }).getAttribute('href'),
    ).toMatch(/\/play\/?$/);
  });

  it('features the newest essay and links to the full writing register', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Latest writing' }),
    ).toBeInTheDocument();

    const essay = screen.getByRole('link', {
      name: 'Read essay: When Knowledge Becomes Accessible, What Is the Purpose of College?',
    });
    expect(essay.getAttribute('href')).toMatch(
      /\/writing\/when-knowledge-becomes-accessible\/?$/,
    );

    expect(
      screen.getByRole('link', { name: /All writing/ }).getAttribute('href'),
    ).toMatch(/\/writing\/?$/);
  });

  it('offers a link to the full project register', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: /All projects/ });

    expect(link.getAttribute('href')).toMatch(/\/projects\/?$/);
  });
});
