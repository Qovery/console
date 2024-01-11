import { useLocation } from 'react-router-dom'
import { CodeEditor } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useHelmDefaultValues } from '../hooks/use-helm-default-values/use-helm-default-values'

export function HelmDefaultValuesPreview() {
  useDocumentTitle('Qovery - Helm default values')
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const payload = params.get('payload')!

  const { data: defaultValues, isLoading } = useHelmDefaultValues({ ...JSON.parse(payload), enabled: Boolean(payload) })

  return <CodeEditor language="yaml" value={defaultValues} loading={isLoading} height="100vh" readOnly />
}

export default HelmDefaultValuesPreview
