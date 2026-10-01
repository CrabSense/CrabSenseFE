import { useEffect } from 'react'

export default function useClickOutside(
  ref,
  handler,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        handler()
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      )
    }
  }, [ref, handler, enabled])
}