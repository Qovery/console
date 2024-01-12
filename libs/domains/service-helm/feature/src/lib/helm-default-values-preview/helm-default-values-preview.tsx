import { Navigate, useLocation } from 'react-router-dom'
import { PREVIEW_CODE } from '@qovery/shared/routes'
import { useHelmDefaultValues } from '../hooks/use-helm-default-values/use-helm-default-values'

export function HelmDefaultValuesPreview() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const payload = params.get('payload')!

  const { data: defaultValues, isLoading } = useHelmDefaultValues({ ...JSON.parse(payload), enabled: Boolean(payload) })

  if (!isLoading) return <Navigate to={PREVIEW_CODE} replace state={{ code: defaultValues, language: 'yaml' }} />
  return null
}

export default HelmDefaultValuesPreview
