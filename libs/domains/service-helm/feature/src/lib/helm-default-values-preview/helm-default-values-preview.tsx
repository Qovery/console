import { Navigate, useSearch } from '@tanstack/react-router'
import { type HelmDefaultValuesRequest } from 'qovery-typescript-axios'
import { PREVIEW_CODE } from '@qovery/shared/routes'
import { EmptyState, LoadingScreen } from '@qovery/shared/ui'
import { useHelmDefaultValues } from '../hooks/use-helm-default-values/use-helm-default-values'

interface HelmDefaultValuesPreviewPayload {
  environmentId: string
  helmDefaultValuesRequest: HelmDefaultValuesRequest
}

export interface PreviewCodeNavigationState {
  code: string
  language: string
  title: string
  description: string
}

type HelmDefaultValuesPreviewPayloadInput = HelmDefaultValuesPreviewPayload | string | null | undefined

function isHelmDefaultValuesPreviewPayload(value: unknown): value is HelmDefaultValuesPreviewPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'environmentId' in value &&
    typeof value.environmentId === 'string' &&
    'helmDefaultValuesRequest' in value
  )
}

function parsePayload(payload?: HelmDefaultValuesPreviewPayloadInput): HelmDefaultValuesPreviewPayload | null {
  if (!payload) {
    return null
  }

  if (isHelmDefaultValuesPreviewPayload(payload)) {
    return payload
  }

  if (typeof payload !== 'string') {
    return null
  }

  try {
    return JSON.parse(payload) as HelmDefaultValuesPreviewPayload
  } catch {
    return null
  }
}

export function HelmDefaultValuesPreview() {
  const { payload } = useSearch({ strict: false }) as { payload?: HelmDefaultValuesPreviewPayloadInput }
  const parsedPayload = parsePayload(payload)

  const { data: defaultValues, isLoading } = useHelmDefaultValues({
    environmentId: parsedPayload?.environmentId ?? '',
    helmDefaultValuesRequest: parsedPayload?.helmDefaultValuesRequest ?? ({} as HelmDefaultValuesRequest),
    enabled: Boolean(parsedPayload),
  })

  if (!parsedPayload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <EmptyState
          title="Unable to load default values.yaml"
          description="The preview request is missing or invalid."
          icon="triangle-exclamation"
          className="h-auto max-w-lg"
        />
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Navigate
      to={PREVIEW_CODE}
      replace
      search={{
        language: 'yaml',
        title: 'Default values.yaml',
        description: 'Read-only preview of the values shipped with the selected Helm source.',
      }}
      state={{ code: defaultValues ?? '' }}
    />
  )
}

export default HelmDefaultValuesPreview
