// TODO(content): one entry per project. Each becomes a record in the vinyl cabinet (first 8 shown).

export type Project = {
  id: string
  title: string
  year: string
  summary: string
  stack: string[]
  links: { label: string; href: string }[]
  /** Record sleeve colors: background and artwork. */
  cover: { bg: string; fg: string }
}

export const projects: Project[] = [
  {
    id: 'project-one',
    title: 'Project One',
    year: '2026',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['React', 'TypeScript'],
    links: [{ label: 'Live', href: '#' }],
    cover: { bg: '#C2412B', fg: '#F0B144' },
  },
  {
    id: 'project-two',
    title: 'Project Two',
    year: '2025',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['Node.js', 'PostgreSQL'],
    links: [{ label: 'GitHub', href: '#' }],
    cover: { bg: '#F0B144', fg: '#8A3E22' },
  },
  {
    id: 'project-three',
    title: 'Project Three',
    year: '2025',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['three.js', 'WebGL'],
    links: [],
    cover: { bg: '#5E2F1D', fg: '#F6A85A' },
  },
  {
    id: 'project-four',
    title: 'Project Four',
    year: '2024',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['Next.js', 'GraphQL'],
    links: [],
    cover: { bg: '#6E8F3A', fg: '#F3E2C0' },
  },
  {
    id: 'project-five',
    title: 'Project Five',
    year: '2023',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['Python'],
    links: [],
    cover: { bg: '#D9662F', fg: '#2B1A14' },
  },
  {
    id: 'project-six',
    title: 'Project Six',
    year: '2022',
    summary: 'Placeholder — what it is, the problem it solved, and your role in it.',
    stack: ['React Native'],
    links: [],
    cover: { bg: '#F3E2C0', fg: '#C2412B' },
  },
]
