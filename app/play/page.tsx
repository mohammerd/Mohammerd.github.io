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
            A compact strategy campaign about timing, trade-offs, and making the
            best use of limited resources. No account required.
          </p>
        </header>

        <HarvestRushGame />

        <p className="play-next-note">
          More games, including Guess the Crop and Farm Memory, are in
          development.
        </p>
      </div>
    </PageWrapper>
  );
}
