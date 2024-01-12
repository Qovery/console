import { useLocation } from 'react-router'
import { CodeEditor } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

function PreviewCode() {
  useDocumentTitle('Preview Code')
  const {
    state: { code, language },
  } = useLocation()

  return <CodeEditor language={language ?? 'yaml'} defaultValue={code ?? ''} height="100vh" readOnly />
}

export default PreviewCode
