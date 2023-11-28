import { useLocation } from 'react-router'
import { CodeEditor } from '@qovery/shared/ui'

function PreviewCode() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)

  return <CodeEditor defaultValue={params.get('code') ?? ''} height="100vh" />
}

export default PreviewCode
