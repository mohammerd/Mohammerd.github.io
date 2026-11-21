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

export default function WritingPage() {
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
        <section className="projects-group">
          <p className="page-subtitle">
            I’m preparing original essays, research notes, and project updates.
            They’ll appear here when they’re ready.
          </p>
          <p className="page-prose">
            For now, you can explore my current work on the{' '}
            <Link href="/projects/">Projects page</Link>.
          </p>
        </section>
      </article>
    </PageWrapper>
  );
}
