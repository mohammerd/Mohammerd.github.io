export interface Skill {
  title: string;
  competency: number;
  category: string[];
}

/** Skills are not published as a ranked list until Muhammad supplies them. */
const skills: Skill[] = [];

export { skills };
