// TODO(content): one entry per company, newest first. Each becomes an apple in the garden.

export type Job = {
  id: string
  company: string
  role: string
  period: string
  location?: string
  highlights: string[]
  /** Apple color. */
  color: string
}

export const experience: Job[] = [
  {
    id: 'company-a',
    company: 'Company A',
    role: 'Senior Software Engineer',
    period: '2024 — now',
    location: 'Remote',
    highlights: ['Placeholder achievement with a measurable result.', 'Another highlight.'],
    color: '#C8322A',
  },
  {
    id: 'company-b',
    company: 'Company B',
    role: 'Software Engineer',
    period: '2021 — 2024',
    highlights: ['Placeholder achievement with a measurable result.', 'Another highlight.'],
    color: '#D9452B',
  },
  {
    id: 'company-c',
    company: 'Company C',
    role: 'Frontend Developer',
    period: '2019 — 2021',
    highlights: ['Placeholder achievement with a measurable result.'],
    color: '#E0A33A',
  },
  {
    id: 'company-d',
    company: 'Company D',
    role: 'Junior Developer',
    period: '2018 — 2019',
    highlights: ['Placeholder achievement with a measurable result.'],
    color: '#9DB043',
  },
]
