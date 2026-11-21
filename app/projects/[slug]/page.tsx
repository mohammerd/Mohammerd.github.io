import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SchemaGraph } from '@/components/Schema';
import PageWrapper from '@/components/Template/PageWrapper';
import { getProject, projects } from '@/data/projects';
import { createPageMetadata } from '@/lib/metadata';
import { breadcrumbNode, webPageNode } from '@/lib/schema';
import { SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return { title: 'Project not found' };

  return createPageMetadata({
    title: project.title,
    description: project.desc,
    path: `/projects/${project.slug}/`,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const pageUrl = `${SITE_URL}/projects/${project.slug}/`;

  return (
    <PageWrapper>
      <SchemaGraph
        nodes={[
          webPageNode({
            url: pageUrl,
            name: project.title,
            description: project.desc,
            hasBreadcrumb: true,
          }),
          breadcrumbNode(pageUrl, [
            { name: 'Home', url: `${SITE_URL}/` },
            { name: 'Projects', url: `${SITE_URL}/projects/` },
            { name: project.title, url: pageUrl },
          ]),
        ]}
      />
      <article className="projects-page project-detail-page">
        <nav className="project-detail-back" aria-label="Breadcrumb">
          <Link href="/projects/">← All projects</Link>
        </nav>
        <header className="projects-header">
          <p className="hero-kicker">{project.subtitle}</p>
          <h1 className="page-title">{project.title}</h1>
          <p className="page-subtitle">{project.desc}</p>
          <p className="project-detail-stage">{project.stage}</p>
          <p>
            <a
              className="button"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit {project.title} <span aria-hidden="true">↗</span>
            </a>
          </p>
        </header>

        <div className="project-detail-content page-prose">
          {project.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </PageWrapper>
  );
}
