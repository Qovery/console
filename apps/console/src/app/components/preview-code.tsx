import { useLocation } from 'react-router'
import { CodeEditor } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

function PreviewCode() {
  useDocumentTitle('Preview Code')
  const { search } = useLocation()
  const params = new URLSearchParams(search)

  return (
    <CodeEditor language={params.get('language') ?? 'yaml'} defaultValue={params.get('code') ?? ''} height="100vh" />
  )
}

export default PreviewCode
