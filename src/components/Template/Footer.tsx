import Link from 'next/link';

import ContactIcons from '@/components/Contact/ContactIcons';
import routes from '@/data/routes';
import { SOURCE_REPOSITORY } from '@/lib/source-repository';
import { smartQuotes } from '@/lib/typography';
import { AUTHOR_NAME } from '@/lib/utils';

interface FooterProps {
  /** Only the site's routes: for a page that already shows the rest. */
  linksOnly?: boolean;
}

export default function Footer({ linksOnly = false }: FooterProps) {
  const siteLinks = (
    <nav className="footer-links" aria-label="Site">
      {routes
        .filter((route) => !route.index)
        .map((route) => (
          <Link key={route.path} href={route.path}>
            {route.label}
          </Link>
        ))}
    </nav>
  );

  if (linksOnly) {
    return (
      <footer className="site-footer-new">
        <div className="footer-content">{siteLinks}</div>
      </footer>
    );
  }

  return (
    <footer className="site-footer-new">
      <div className="footer-content">
        <div className="footer-identity">
          <Link href="/" className="footer-avatar footer-avatar--monogram">
            MZ
          </Link>
          <div className="footer-info">
            <span className="footer-name">{smartQuotes(AUTHOR_NAME)}</span>
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} ·{' '}
              <a
                href={`https://github.com/${SOURCE_REPOSITORY}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </p>
          </div>
        </div>

        <div className="footer-right">
          {siteLinks}
          <ContactIcons />
        </div>
      </div>
    </footer>
  );
}
