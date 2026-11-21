import type { Metadata } from 'next';
import Link from 'next/link';

import Education from '@/components/Resume/Education';
import PageWrapper from '@/components/Template/PageWrapper';
import profile from '@/data/profile.json';
import degrees from '@/data/resume/degrees';
import { createPageMetadata } from '@/lib/metadata';
import { RESUME_JSON_URL } from '@/lib/resumeJson';
import { AUTHOR_NAME } from '@/lib/utils';

const description = `Education and independent learning background for ${AUTHOR_NAME}, a student and independent AI safety researcher.`;

const resumeMetadata = createPageMetadata({
  title: 'Resume',
  description,
  path: '/resume/',
});

export const metadata: Metadata = {
  ...resumeMetadata,
  alternates: {
    ...resumeMetadata.alternates,
    types: {
      'application/json': RESUME_JSON_URL,
    },
  },
};

export default function ResumePage() {
  return (
    <PageWrapper>
      <section className="resume-page">
        <header className="resume-header">
          <div className="resume-header-row">
            <h1 className="page-title">{AUTHOR_NAME}</h1>
            <a
              href="../resume.json"
              className="button button-secondary button-compact"
              title="JSON Resume"
              aria-label="JSON Resume"
            >
              JSON Resume
            </a>
          </div>
          <p className="resume-summary">{profile.role}</p>
          <p className="resume-summary">
            I’m studying software engineering while building my understanding of
            AI safety through independent research, practical experiments,
            software projects, technical documentation, and research papers.
          </p>
        </header>

        <div className="resume-content">
          <section id="education" className="resume-section">
            <Education data={degrees} />
          </section>

          <section id="independent-learning" className="resume-section">
            <div className="section-header">
              <h2 className="section-heading">Independent learning</h2>
            </div>
            <p className="resume-note">
              Alongside formal study, I’m largely self-taught in the areas I
              work on. My learning is centred on software engineering, AI
              safety, machine learning, autonomous AI systems, and security. I
              develop this knowledge by building, testing ideas, reading
              technical material, and studying how systems behave in practice.
            </p>
          </section>
        </div>

        <p className="resume-note">
          My current research and projects are on the{' '}
          <Link href="/projects/">Projects page</Link>.
        </p>
      </section>
    </PageWrapper>
  );
}
