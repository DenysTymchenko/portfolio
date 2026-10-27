import { create } from 'zustand'
import { projects } from '../data/projects'

/** The points of interest. (A union, so it can't be an interface.) */
export type ZoneId = 'desk' | 'vinyl' | 'garden'

export interface IAppState {
  /** False until the first input: the camera holds the intro shot of the whole diorama. */
  started: boolean
  /** The zone the panda is standing in, if any. */
  zone: ZoneId | null
  /** Panda is on the chair and the camera is on the laptop screen. */
  seated: boolean
  projectId: string | null
  jobId: string | null
  /** Job ids whose apples have fallen off the trees. */
  dropped: string[]
  /** Bumped by "interact" in the garden; Garden shakes the nearest tree. */
  shakeRequest: number

  start: () => void
  setZone: (zone: ZoneId | null) => void
  sit: () => void
  stand: () => void
  playProject: (id: string) => void
  showJob: (id: string) => void
  dropApple: (id: string) => void
  /** E key / tap on a prompt: does whatever the current zone offers. */
  interact: () => void
}

export const useAppState = create<IAppState>((set, get) => ({
  started: false,
  zone: null,
  seated: false,
  projectId: null,
  jobId: null,
  dropped: [],
  shakeRequest: 0,

  start: () => get().started || set({ started: true }),
  setZone: (zone) => set({ zone }),
  sit: () => set({ seated: true, started: true }),
  stand: () => set({ seated: false }),
  playProject: (projectId) => set({ projectId, started: true }),
  showJob: (jobId) => set({ jobId }),
  dropApple: (id) => set((s) => (s.dropped.includes(id) ? s : { dropped: [...s.dropped, id] })),
  interact: () => {
    const { zone, seated, projectId } = get()
    if (seated) return set({ seated: false })
    if (zone === 'desk') return set({ seated: true })
    if (zone === 'vinyl') {
      const next = (projects.findIndex((p) => p.id === projectId) + 1) % projects.length
      return set({ projectId: projects[next].id })
    }
    if (zone === 'garden') return set((s) => ({ shakeRequest: s.shakeRequest + 1 }))
  },
}))
