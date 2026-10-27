import { create } from 'zustand'

/** Where the camera is looking: the whole diorama or one of the three points of interest. */
export type Focus = 'overview' | 'desk' | 'vinyl' | 'garden'

type State = {
  focus: Focus
  projectId: string | null
  jobId: string | null
  setFocus: (focus: Focus) => void
  openProject: (id: string | null) => void
  openJob: (id: string | null) => void
}

export const useStore = create<State>((set) => ({
  focus: 'overview',
  projectId: null,
  jobId: null,
  setFocus: (focus) => set({ focus }),
  openProject: (projectId) => set({ projectId, focus: 'vinyl' }),
  openJob: (jobId) => set({ jobId, focus: 'garden' }),
}))
