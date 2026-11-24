import HarvestRushGame from '@/components/Play/HarvestRushGame';
import { SchemaGraph } from '@/components/Schema';
import PageWrapper from '@/components/Template/PageWrapper';
import { createPageMetadata } from '@/lib/metadata';
import { collectionPageNode, sectionPageNodes } from '@/lib/schema';

const PAGE_TITLE = 'Play';
const DESCRIPTION =
  'Play a three-mission agricultural strategy campaign built around harvest planning, weather risk, and resource management.';

export const metadata = createPageMetadata({
  title: PAGE_TITLE,
  description: DESCRIPTION,
  path: '/play/',
});

export default function PlayPage() {
  return (
    <PageWrapper>
      <SchemaGraph
        nodes={sectionPageNodes(
          collectionPageNode,
          '/play/',
          PAGE_TITLE,
          DESCRIPTION,
        )}
      />
      <div className="play-page">
        <header className="play-header">
          <p className="play-eyebrow">INTERACTIVE PLAYGROUND / 001</p>
          <h1 className="page-title">{PAGE_TITLE}</h1>
          <p className="page-subtitle">
            A compact strategy campaign about timing, trade-offs, and making
            the best use of limited resources. No account required.
          </p>
        </header>

        <HarvestRushGame />

        <section className="play-next-games" aria-labelledby="play-next-title">
          <h2 id="play-next-title" className="section-heading">
            Coming next
          </h2>
          <p className="play-next-note">
            Two more games are in development. They will be added when they are
            complete and ready to play.
          </p>
          <div className="play-next-grid">
            <article className="play-next-card">
              <h3>Guess the Crop</h3>
              <p>
                Identify crops from visual clues, growing conditions, and
                practical field knowledge.
              </p>
              <span className="play-next-status">IN DEVELOPMENT / 002</span>
            </article>
            <article className="play-next-card">
              <h3>Farm Memory</h3>
              <p>
                A timed matching challenge built around crops, seeds, tools, and
                agricultural patterns.
              </p>
              <span className="play-next-status">IN DEVELOPMENT / 003</span>
            </article>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
