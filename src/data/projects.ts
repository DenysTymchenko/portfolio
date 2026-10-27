// TODO(content): one entry per project. Each becomes a record in the vinyl cabinet (first 8 shown).

export interface IProjectLink {
  label: string
  href: string
}

/** Record sleeve colors: background and artwork. */
export interface IProjectCover {
  bg: string
  fg: string
}

export interface IProject {
  id: string
  title: string
  year: string
  summary: string
  stack: string[]
  links: IProjectLink[]
  cover: IProjectCover
}

export const projects: IProject[] = [
  {
    id: 'project-one',
    title: 'Project One',
    year: '2026',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['React', 'TypeScript'],
    links: [{ label: 'Live', href: '#' }],
    cover: { bg: '#F2664A', fg: '#FFC94D' },
  },
  {
    id: 'project-two',
    title: 'Project Two',
    year: '2025',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['Node.js', 'PostgreSQL'],
    links: [{ label: 'GitHub', href: '#' }],
    cover: { bg: '#FFC24B', fg: '#F2664A' },
  },
  {
    id: 'project-three',
    title: 'Project Three',
    year: '2025',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['three.js', 'WebGL'],
    links: [],
    cover: { bg: '#45B5AA', fg: '#FFF1DC' },
  },
  {
    id: 'project-four',
    title: 'Project Four',
    year: '2024',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['Next.js', 'GraphQL'],
    links: [],
    cover: { bg: '#7FA7E8', fg: '#FFF1DC' },
  },
  {
    id: 'project-five',
    title: 'Project Five',
    year: '2023',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['Python'],
    links: [],
    cover: { bg: '#F7A1B5', fg: '#3B3552' },
  },
  {
    id: 'project-six',
    title: 'Project Six',
    year: '2022',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['React Native'],
    links: [],
    cover: { bg: '#86D05A', fg: '#3B3552' },
  },
]
