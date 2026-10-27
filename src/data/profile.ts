// TODO(content): replace the placeholders with your real details.

export interface IContact {
  label: string
  value: string
  href: string
}

export interface IStackGroup {
  group: string
  items: string[]
}

export interface IProfile {
  name: string
  role: string
  location: string
  summary: string
  contacts: IContact[]
  stack: IStackGroup[]
}

export const profile: IProfile = {
  name: 'Your Name',
  role: 'Software Engineer',
  location: 'City, Country',
  summary:
    'Placeholder summary — two or three sentences about what you build, what you care about, and what you are looking for next.',
  contacts: [
    { label: 'Email', value: 'you@example.com', href: 'mailto:you@example.com' },
    { label: 'GitHub', value: 'github.com/you', href: 'https://github.com/you' },
    { label: 'LinkedIn', value: 'linkedin.com/in/you', href: 'https://www.linkedin.com/in/you' },
  ],
  stack: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'three.js', 'CSS'] },
    { group: 'Backend', items: ['Node.js', 'PostgreSQL', 'REST', 'GraphQL'] },
    { group: 'Tools', items: ['Git', 'Docker', 'CI/CD', 'Figma'] },
  ],
}
