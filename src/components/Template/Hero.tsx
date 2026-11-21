import Link from 'next/link';

import profile from '@/data/profile.json';
import { smartQuotes } from '@/lib/typography';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-primary">
          <p className="hero-kicker">Student · Independent AI Safety Researcher</p>
          <h1 className="hero-title">
            <span className="hero-name">{smartQuotes(profile.name)}</span>
          </h1>
          <p className="hero-tagline">
            I’m interested in building AI systems that are more reliable,
            controllable, and useful in the real world.
          </p>
          <p className="hero-summary">
            My work explores AI safety across different domains, from
            agricultural intelligence and multilingual systems to the
            evaluation and control of autonomous AI agents.
          </p>
          <div className="hero-cta">
            <Link href="/about" className="button">
              About me
            </Link>
            <Link href="/projects" className="hero-resume-link">
              Explore projects
            </Link>
          </div>
        </div>

        <figure className="hero-portrait">
          <div className="hero-monogram" aria-hidden="true">MZ</div>
          <figcaption>AI safety · Independent research</figcaption>
        </figure>
      </div>
    </section>
  );
}
