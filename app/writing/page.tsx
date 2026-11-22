import type { Metadata } from 'next';
import Link from 'next/link';

import { SchemaGraph } from '@/components/Schema';
import PageWrapper from '@/components/Template/PageWrapper';
import { createPageMetadata } from '@/lib/metadata';
import {
  blogNode,
  collectionPageNode,
  sectionPageNodes,
  WRITING_DESCRIPTION,
} from '@/lib/schema';
import { smartQuotes } from '@/lib/typography';
import { formatDate } from '@/lib/utils';
import { getWritingItems, type WritingItem } from '@/lib/writing';

const writingMetadata = createPageMetadata({
  title: 'Writing',
  description: WRITING_DESCRIPTION,
  path: '/writing/',
});

export const metadata: Metadata = {
  ...writingMetadata,
  alternates: {
    ...writingMetadata.alternates,
    types: { 'application/rss+xml': '/feed.xml' },
  },
};

function WritingEntry({ item }: { item: WritingItem }) {
  const label = item.isExternal
    ? `Read ${item.title} on ${item.source}`
    : `Read essay: ${item.title}`;
  const content = (
    <>
      <div className="project-entry-meta">
        {item.date && (
          <time className="project-dates" dateTime={item.date}>
            {formatDate(item.date)}
          </time>
        )}
        <span className="project-entry-role">
          {item.isExternal ? item.source : 'Essay'}
        </span>
      </div>
      <div className="project-entry-body">
        <h3 className="project-entry-title">
          {smartQuotes(item.title)}
          <span className="project-entry-external" aria-hidden="true">
            {item.isExternal ? '↗' : '→'}
          </span>
        </h3>
        <p className="project-entry-desc">{smartQuotes(item.description)}</p>
      </div>
    </>
  );

  return item.isExternal ? (
    <a
      className="project-entry"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {content}
    </a>
  ) : (
    <Link className="project-entry" href={item.url} aria-label={label}>
      {content}
    </Link>
  );
}

export default function WritingPage() {
  const items = getWritingItems();
  const [page, breadcrumb] = sectionPageNodes(
    collectionPageNode,
    '/writing/',
    'Writing',
    WRITING_DESCRIPTION,
  );

  return (
    <PageWrapper>
      <SchemaGraph nodes={[page, blogNode(), breadcrumb]} />
      <article className="writing-page">
        <header className="page-header">
          <h1 className="page-title">Writing</h1>
        </header>
        <section className="projects-group" aria-labelledby="writing-essays">
          <div className="section-header">
            <h2 id="writing-essays" className="section-heading">
              Essays &amp; research notes
            </h2>
          </div>
          <p className="page-subtitle">
            Essays, research notes, and updates on AI safety, agricultural AI,
            and building.
          </p>
          {items.length > 0 ? (
            <ol className="projects-register">
              {items.map((item) => (
                <li key={item.url}>
                  <WritingEntry item={item} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="page-prose">
              My original essays and research notes will appear here.
            </p>
          )}
        </section>
        <p className="page-prose">
          Subscribe to the <Link href="/feed.xml">RSS feed</Link> to follow new
          writing.
        </p>
      </article>
    </PageWrapper>
  );
}
