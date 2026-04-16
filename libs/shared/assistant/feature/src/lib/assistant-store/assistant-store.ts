// XXX: Use this store to avoid re-rendering all pages or routes just to open the documentation
import { useSyncExternalStore } from 'react'

type Listener = () => void

let assistantOpen = false

const listeners = new Set<Listener>()

function subscribe(listener: Listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  return assistantOpen
}

export function useAssistantOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function setAssistantOpen(nextValue: boolean) {
  if (assistantOpen === nextValue) {
    return
  }

  assistantOpen = nextValue
  emitChange()
}

export function toggleAssistantOpen() {
  setAssistantOpen(!assistantOpen)
}
