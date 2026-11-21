import type { Metadata } from 'next';
import Link from 'next/link';

import Entry from '@/components/Projects/Entry';
import { SchemaGraph } from '@/components/Schema';
import Hero from '@/components/Template/Hero';
import PageWrapper from '@/components/Template/PageWrapper';
import { projects } from '@/data/projects';
import { profilePageNode } from '@/lib/schema';
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  return (
    <PageWrapper>
      <SchemaGraph
        nodes={[profilePageNode({ url: `${SITE_URL}/`, name: AUTHOR_NAME })]}
      />
      <Hero />
      <section className="home-writing projects-home" aria-labelledby="home-projects-title">
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
    </PageWrapper>
  );
}
