/** No employment history is published on this site yet. */
export interface Position {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate?: string;
  commitment?: 'part-time';
  summary?: string;
  highlights?: string[];
}

const work: Position[] = [];

export default work;
