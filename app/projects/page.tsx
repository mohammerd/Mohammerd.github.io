import type { Metadata } from 'next';

import Entry from '@/components/Projects/Entry';
import { SchemaGraph } from '@/components/Schema';
import PageWrapper from '@/components/Template/PageWrapper';
import { projects } from '@/data/projects';
import { createPageMetadata } from '@/lib/metadata';
import { collectionPageNode, sectionPageNodes } from '@/lib/schema';

const PAGE_TITLE = 'Projects';
const DESCRIPTION =
  'Research and projects by Muhammad Zakari across agricultural AI safety and the control of autonomous AI systems.';

export const metadata: Metadata = createPageMetadata({
  title: PAGE_TITLE,
  description: DESCRIPTION,
  path: '/projects/',
});

export default function ProjectsPage() {
  return (
    <PageWrapper>
      <SchemaGraph
        nodes={sectionPageNodes(
          collectionPageNode,
          '/projects/',
          PAGE_TITLE,
          DESCRIPTION,
        )}
      />
      <div className="projects-page">
        <header className="projects-header">
          <h1 className="page-title">{PAGE_TITLE}</h1>
          <p className="page-subtitle">
            A closer look at the research and products I’m working on.
          </p>
        </header>

        <section className="projects-group" aria-labelledby="projects-current">
          <div className="section-header">
            <h2 id="projects-current" className="section-heading">
              Research &amp; products
            </h2>
          </div>
          <ol className="projects-register">
            {projects.map((project) => (
              <li key={project.slug}>
                <Entry data={project} />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </PageWrapper>
  );
}
