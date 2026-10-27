// TODO(content): one entry per company, newest first. Each becomes an apple in the garden.

export interface IExperience {
  id: string
  company: string
  role: string
  period: string
  location?: string
  highlights: string[]
  /** Apple color. */
  color: string
}

export const experience: IExperience[] = [
  {
    id: 'company-a',
    company: 'Company A',
    role: 'Senior Software Engineer',
    period: '2024 — now',
    location: 'Remote',
    highlights: ['Placeholder achievement with a measurable result.', 'Another highlight.'],
    color: '#F2553C',
  },
  {
    id: 'company-b',
    company: 'Company B',
    role: 'Software Engineer',
    period: '2021 — 2024',
    highlights: ['Placeholder achievement with a measurable result.', 'Another highlight.'],
    color: '#FF7A45',
  },
  {
    id: 'company-c',
    company: 'Company C',
    role: 'Frontend Developer',
    period: '2019 — 2021',
    highlights: ['Placeholder achievement with a measurable result.'],
    color: '#FFC24B',
  },
  {
    id: 'company-d',
    company: 'Company D',
    role: 'Junior Developer',
    period: '2018 — 2019',
    highlights: ['Placeholder achievement with a measurable result.'],
    color: '#9BD15A',
  },
]
