import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = String(title)
  }, [title])
}

export default useDocumentTitle
