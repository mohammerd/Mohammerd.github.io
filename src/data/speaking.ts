/** No public speaking appearances are listed yet. */
export interface Appearance {
  title: string;
  format: 'Panel' | 'Arsenal Lab' | 'Tech session';
  date: string;
  place: string;
  desc: string;
  link: string;
}

const appearances: Appearance[] = [];

export function getAppearances(): Appearance[] {
  return appearances;
}
