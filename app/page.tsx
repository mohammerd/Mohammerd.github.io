import type { Metadata } from 'next';
import Link from 'next/link';

import Entry from '@/components/Projects/Entry';
import HarvestRushGame from '@/components/Play/HarvestRushGame';
import { SchemaGraph } from '@/components/Schema';
import Hero from '@/components/Template/Hero';
import PageWrapper from '@/components/Template/PageWrapper';
import { projects } from '@/data/projects';
import { profilePageNode } from '@/lib/schema';
import { smartQuotes } from '@/lib/typography';
import {
  AUTHOR_NAME,
  formatDate,
  SITE_DESCRIPTION,
  SITE_URL,
} from '@/lib/utils';
import { getWritingItems, type WritingItem } from '@/lib/writing';

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
};

function HomeWritingEntry({ item }: { item: WritingItem }) {
  const label = item.isExternal
    ? `Read ${item.title} on ${item.source}`
    : `Read essay: ${item.title}`;
  const content = (
    <>
      <span className="home-writing-meta">
        {item.date ? formatDate(item.date) : 'Undated'}
        {' · '}
        {item.isExternal ? item.source : 'Essay'}
      </span>
      <span className="home-writing-copy">
        <h3>{smartQuotes(item.title)}</h3>
      </span>
      <span className="home-writing-arrow" aria-hidden="true">
        {item.isExternal ? '↗' : '→'}
      </span>
    </>
  );

  return item.isExternal ? (
    <a
      className="home-writing-item"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {content}
    </a>
  ) : (
    <Link className="home-writing-item" href={item.url} aria-label={label}>
      {content}
    </Link>
  );
}

export default function HomePage() {
  const latestWriting = getWritingItems().slice(0, 2);

  return (
    <PageWrapper>
      <SchemaGraph
        nodes={[profilePageNode({ url: `${SITE_URL}/`, name: AUTHOR_NAME })]}
      />
      <Hero />
      <section
        className="home-writing projects-home"
        aria-labelledby="home-projects-title"
      >
        <div className="home-writing-header">
          <h2 id="home-projects-title" className="section-heading">
            Current projects
          </h2>
          <Link href="/projects/" className="home-writing-all">
            All projects <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ol className="projects-register">
          {projects.map((project) => (
            <li key={project.slug}>
              <Entry data={project} />
            </li>
          ))}
        </ol>
      </section>
      <section
        className="home-writing home-play"
        aria-labelledby="home-play-title"
      >
        <div className="home-writing-header home-play-header">
          <p className="home-play-kicker">INTERACTIVE CAMPAIGN / 001</p>
          <h2 id="home-play-title" className="section-heading">
            Harvest Rush
          </h2>
          <p className="home-play-summary">
            Plan three field operations around weather, timing, and limited
            resources. Play the campaign here, with no account required.
          </p>
          <Link href="/play/" className="home-writing-all">
            Game details <span aria-hidden="true">→</span>
          </Link>
        </div>
        <HarvestRushGame />
      </section>
      {latestWriting.length > 0 && (
        <section className="home-writing" aria-labelledby="home-writing-title">
          <div className="home-writing-header">
            <h2 id="home-writing-title" className="section-heading">
              Latest writing
            </h2>
            <Link href="/writing/" className="home-writing-all">
              All writing <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-writing-list">
            {latestWriting.map((item) => (
              <HomeWritingEntry key={item.url} item={item} />
            ))}
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
