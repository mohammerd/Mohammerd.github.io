import GameHub from '@/components/Play/GameHub';
import { SchemaGraph } from '@/components/Schema';
import PageWrapper from '@/components/Template/PageWrapper';
import { createPageMetadata } from '@/lib/metadata';
import { collectionPageNode, sectionPageNodes } from '@/lib/schema';

const PAGE_TITLE = 'Play';
const DESCRIPTION =
  'Play AgroGuardAI, a hands-on farming simulation, or Snake, a modern arcade classic. Both run in your browser without an account.';

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
            Two browser-based games. Run a working farm or play an arcade
            classic, all without creating an account.
          </p>
        </header>

        <GameHub />
      </div>
    </PageWrapper>
  );
}
