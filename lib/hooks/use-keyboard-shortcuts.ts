import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  callback: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()

        if (metaMatch && ctrlMatch && shiftMatch && keyMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
