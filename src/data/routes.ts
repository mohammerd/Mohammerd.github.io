import { AUTHOR_NAME } from '@/lib/utils';

interface Route {
  label: string;
  path: string;
  index?: boolean;
  primary?: boolean;
}

const routes: Route[] = [
  { index: true, label: AUTHOR_NAME, path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Resume', path: '/resume' },
  { label: 'Projects', path: '/projects' },
  { label: 'Play', path: '/play' },
  { label: 'Writing', path: '/writing' },
  { label: 'Contact', path: '/contact' },
];

export default routes;
