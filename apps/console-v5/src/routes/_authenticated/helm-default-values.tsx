import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { HelmDefaultValuesPreviewV5 } from '@qovery/domains/service-helm/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

const helmDefaultValuesSearchSchema = z.object({
  payload: z
    .union([
      z.string(),
      z.object({
        environmentId: z.string(),
        helmDefaultValuesRequest: z.unknown(),
      }),
    ])
    .optional(),
})

export const Route = createFileRoute('/_authenticated/helm-default-values')({
  component: HelmDefaultValues,
  validateSearch: helmDefaultValuesSearchSchema,
})

function HelmDefaultValues() {
  useDocumentTitle('Default values.yaml')

  return <HelmDefaultValuesPreviewV5 />
}
