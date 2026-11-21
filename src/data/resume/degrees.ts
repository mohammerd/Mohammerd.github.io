export interface Degree {
  school: string;
  degree: string;
  link?: string;
  year?: number;
  current?: boolean;
}

const degrees: Degree[] = [
  {
    school: 'Katsina State Institute of Technology and Management (KSITM)',
    degree: 'Computer Software Engineering',
    current: true,
  },
];

export default degrees;
