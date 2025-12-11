import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls callback when matching key combination is pressed', () => {
    const callback = jest.fn()
    const shortcuts = [
      { key: 'k', metaKey: true, callback }
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })
    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call callback when key combination does not match', () => {
    const callback = jest.fn()
    const shortcuts = [
      { key: 'k', metaKey: true, callback }
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: false,
    })
    window.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('handles multiple shortcuts', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const shortcuts = [
      { key: 'k', metaKey: true, callback: callback1 },
      { key: 'n', metaKey: true, callback: callback2 }
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event1 = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })
    window.dispatchEvent(event1)

    const event2 = new KeyboardEvent('keydown', {
      key: 'n',
      metaKey: true,
    })
    window.dispatchEvent(event2)

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('handles ctrl key modifier', () => {
    const callback = jest.fn()
    const shortcuts = [
      { key: 'k', ctrlKey: true, callback }
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    })
    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('handles shift key modifier', () => {
    const callback = jest.fn()
    const shortcuts = [
      { key: 'k', shiftKey: true, callback }
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      shiftKey: true,
    })
    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('cleans up event listener on unmount', () => {
    const callback = jest.fn()
    const shortcuts = [
      { key: 'k', metaKey: true, callback }
    ]

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts))
    unmount()

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })
    window.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('is case insensitive', () => {
    const callback = jest.fn()
    const shortcuts = [
      { key: 'K', metaKey: true, callback }
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    })
    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
