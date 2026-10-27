import { useEffect } from 'react'
import { experience } from '../content/experience'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { useStore, type Focus } from '../store'

const NAV: { focus: Focus; label: string }[] = [
  { focus: 'desk', label: 'About' },
  { focus: 'vinyl', label: 'Projects' },
  { focus: 'garden', label: 'Experience' },
]

function ProjectsPanel() {
  const projectId = useStore((s) => s.projectId)
  const openProject = useStore((s) => s.openProject)
  const project = projects.find((p) => p.id === projectId)
  return (
    <aside className="panel" aria-label="Projects">
      <h2 className="panel__title">Projects</h2>
      <ul className="picker">
        {projects.map((p) => (
          <li key={p.id}>
            <button className={p.id === projectId ? 'is-active' : ''} onClick={() => openProject(p.id)}>
              <span className="swatch" style={{ background: p.cover.bg, borderColor: p.cover.fg }} />
              {p.title}
              <span className="muted">{p.year}</span>
            </button>
          </li>
        ))}
      </ul>
      {project ? (
        <article className="detail">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <ul className="chips">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {project.links.length > 0 && (
            <p className="links">
              {project.links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </p>
          )}
        </article>
      ) : (
        <p className="muted">Pick a record to put it on the turntable.</p>
      )}
    </aside>
  )
}

function ExperiencePanel() {
  const jobId = useStore((s) => s.jobId)
  const openJob = useStore((s) => s.openJob)
  const job = experience.find((j) => j.id === jobId)
  return (
    <aside className="panel" aria-label="Experience">
      <h2 className="panel__title">Experience</h2>
      <ul className="picker">
        {experience.map((j) => (
          <li key={j.id}>
            <button className={j.id === jobId ? 'is-active' : ''} onClick={() => openJob(j.id)}>
              <span className="swatch swatch--round" style={{ background: j.color }} />
              {j.company}
              <span className="muted">{j.period}</span>
            </button>
          </li>
        ))}
      </ul>
      {job ? (
        <article className="detail">
          <h3>{job.role}</h3>
          <p className="muted">
            {job.company} · {job.period}
            {job.location ? ` · ${job.location}` : ''}
          </p>
          <ul className="bullets">
            {job.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </article>
      ) : (
        <p className="muted">Pick an apple to see that chapter.</p>
      )}
    </aside>
  )
}

export function Overlay() {
  const focus = useStore((s) => s.focus)
  const setFocus = useStore((s) => s.setFocus)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocus('overview')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setFocus])

  return (
    <>
      <header className="hud">
        <button className="brand" onClick={() => setFocus('overview')}>
          <strong>{profile.name}</strong>
          <span>{profile.role}</span>
        </button>
        <nav className="hud__nav">
          {NAV.map((n) => (
            <button key={n.focus} className={focus === n.focus ? 'is-active' : ''} onClick={() => setFocus(n.focus)}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      {focus !== 'overview' && (
        <button className="back" onClick={() => setFocus('overview')}>
          ← Back to the room
        </button>
      )}
      {focus === 'vinyl' && <ProjectsPanel />}
      {focus === 'garden' && <ExperiencePanel />}
      {focus === 'overview' && <p className="hint">Click the desk, the records or the apple trees · drag to look around</p>}
    </>
  )
}
