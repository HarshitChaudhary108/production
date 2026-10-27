import { useCallback, useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

export function useColumnResize(onResize: (key: string, width: number) => void) {
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  const startResize = useCallback((key: string, event: ReactMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const headerCell = (event.currentTarget as HTMLElement).parentElement
    const startWidth = headerCell ? headerCell.getBoundingClientRect().width : 120
    const startX = event.clientX

    const move = (next: MouseEvent) => {
      const width = Math.min(600, Math.max(64, Math.round(startWidth + next.clientX - startX)))
      onResize(key, width)
    }
    const up = () => cleanupRef.current?.()

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)

    cleanupRef.current = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      cleanupRef.current = null
    }
  }, [onResize])

  return startResize
}
