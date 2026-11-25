import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { resolve } from 'node:path';

const sourceDirectory = resolve('snakegame-source/dist');
const destinationDirectory = resolve('public/Snakegame');
const sourceIndex = resolve(sourceDirectory, 'index.html');

if (!existsSync(sourceIndex)) {
  throw new Error(
    'Snakegame was not built. Expected snakegame-source/dist/index.html.',
  );
}

const html = readFileSync(sourceIndex, 'utf8');
if (!html.includes('/Snakegame/')) {
  throw new Error(
    'Snakegame build does not contain the /Snakegame/ asset base.',
  );
}

rmSync(destinationDirectory, { recursive: true, force: true });
mkdirSync(destinationDirectory, { recursive: true });
cpSync(sourceDirectory, destinationDirectory, { recursive: true });

const copiedEntries = readdirSync(destinationDirectory);
if (!copiedEntries.includes('index.html') || !copiedEntries.includes('assets')) {
  throw new Error(
    'Snakegame static output is incomplete after copying.',
  );
}

console.log(
  `Included Snakegame static build at public/Snakegame (${copiedEntries.length} top-level entries).`,
);
