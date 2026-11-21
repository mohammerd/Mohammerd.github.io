import Image from 'next/image';
import Link from 'next/link';

import type { Project } from '@/data/projects';
import { smartQuotes } from '@/lib/typography';
import { withBasePath } from '@/lib/utils';

interface EntryProps {
  data: Project;
}

const THUMBNAIL = { width: 240, height: 150 } as const;

export default function Entry({ data }: EntryProps) {
  const { title, subtitle, desc, image, slug } = data;
  const displayTitle = smartQuotes(title);

  return (
    <Link
      className="project-entry"
      href={`/projects/${slug}/`}
      aria-label={`Read more about ${displayTitle}`}
    >
      {image && (
        <Image
          className="project-entry-thumb"
          src={withBasePath(image)}
          alt=""
          width={THUMBNAIL.width}
          height={THUMBNAIL.height}
          loading="lazy"
        />
      )}
      <div className="project-entry-meta">
        {subtitle && (
          <span className="project-entry-role">{smartQuotes(subtitle)}</span>
        )}
      </div>
      <div className="project-entry-body">
        <h3 className="project-entry-title">
          {displayTitle}
          <span className="project-entry-external" aria-hidden="true">
            →
          </span>
        </h3>
        <p className="project-entry-desc">{smartQuotes(desc)}</p>
      </div>
    </Link>
  );
}
