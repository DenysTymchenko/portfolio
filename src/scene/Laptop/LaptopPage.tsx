import { Html } from '@react-three/drei'
import { useState } from 'react'
import { profile } from '../../data/profile'
import { useAppState } from '../../state/appState'
import { IS_TOUCH } from '../../utils/input'

const TABS = ['about.md', 'stack.json', 'contacts.sh'] as const
type Tab = (typeof TABS)[number] // a union of the tab names, so it can't be an interface

interface ILaptopPageProps {
  /** True while the panda is seated at the desk. */
  visible: boolean
}

/**
 * The real web page on the laptop display (about / stack / contacts), shown while the panda is
 * seated. Placed by Laptop at Anchor_LaptopScreen, whose +Z is the screen normal.
 * distanceFactor 0.2 maps 1px to 0.2/400 m, so 700x440px fills the 0.35x0.22m panel. Hidden
 * rather than unmounted: unmounting drei's Html mid-render logs React 19 errors.
 */
export function LaptopPage({ visible }: ILaptopPageProps) {
  const [tab, setTab] = useState<Tab>('about.md')
  const stand = useAppState((s) => s.stand)
  return (
    // pointerEvents: drei's wrapper divs would otherwise swallow clicks on the 3D laptop while hidden.
    <Html transform distanceFactor={0.2} position={[0, 0, 0.002]} pointerEvents={visible ? 'auto' : 'none'}>
      <div className={visible ? 'laptop' : 'laptop is-hidden'} aria-hidden={!visible} onPointerDown={(e) => e.stopPropagation()}>
        <div className="laptop__bar">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
          <nav className="laptop__tabs">
            {TABS.map((t) => (
              <button key={t} className={t === tab ? 'is-active' : ''} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </nav>
          <button className="laptop__exit" onClick={stand} title={IS_TOUCH ? 'Stand up' : 'Stand up (Esc)'}>
            ⏻ stand up
          </button>
        </div>
        <div className="laptop__body">
          {tab === 'about.md' && (
            <>
              <h1>{profile.name}</h1>
              <p className="muted">
                {profile.role} · {profile.location}
              </p>
              <p>{profile.summary}</p>
            </>
          )}
          {tab === 'stack.json' && (
            <div className="stack">
              {profile.stack.map((g) => (
                <div key={g.group}>
                  <h2>{g.group}</h2>
                  <ul className="chips">
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {tab === 'contacts.sh' && (
            <ul className="contacts">
              {profile.contacts.map((c) => (
                <li key={c.label}>
                  <span className="muted">$ open {c.label.toLowerCase()}</span>
                  <a href={c.href} target="_blank" rel="noreferrer">
                    {c.value}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Html>
  )
}
