import { create } from "zustand"

export const useUi = create<{
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}>()((set) => ({
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}))
