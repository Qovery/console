import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import posthog from 'posthog-js'
import {
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDeployService } from '@qovery/domains/services/feature'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useCreateHelmService } from '../../hooks/use-create-helm-service/use-create-helm-service'
import { useHelmRepositories } from '../../hooks/use-helm-repositories/use-helm-repositories'
import { helmCreationSteps, useHelmCreateContext } from '../helm-creation-flow'
import { buildHelmCreatePayload } from '../helm-summary-utils/helm-summary-utils'
import { HelmSummaryView } from './helm-summary-view'

export interface HelmStepSummaryProps {
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

export function HelmStepSummary({ labelsGroup, annotationsGroup }: HelmStepSummaryProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const { creationFlowUrl, generalForm, valuesOverrideFileForm, valuesOverrideArgumentsForm, setCurrentStep } =
    useHelmCreateContext()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)

  const generalData = generalForm.getValues()
  const valuesOverrideFileData = valuesOverrideFileForm.getValues()
  const valuesOverrideArgumentsData = valuesOverrideArgumentsForm.getValues()

  const { mutateAsync: createHelmService } = useCreateHelmService()
  const { mutateAsync: deployService } = useDeployService({ organizationId, projectId, environmentId })
  const { data: helmRepositories = [] } = useHelmRepositories({ organizationId })

  useEffect(() => {
    setCurrentStep(helmCreationSteps.length)
  }, [setCurrentStep])

  useEffect(() => {
    if (!generalData.name || !generalData.source_provider) {
      navigate({ to: `${creationFlowUrl}/general`, search })
    }
  }, [creationFlowUrl, generalData.name, generalData.source_provider, navigate, search])

  const handleSubmit = async (withDeploy: boolean) => {
    setSubmitMode(withDeploy ? 'create-and-deploy' : 'create')

    try {
      const service = await createHelmService({
        environmentId,
        helmRequest: buildHelmCreatePayload({
          generalData,
          valuesOverrideFileData,
          valuesOverrideArgumentsData,
        }),
      })

      if (withDeploy) {
        await deployService({
          serviceId: service.id,
          serviceType: 'HELM',
        })
      }

      posthog.capture('create-service', {
        selectedServiceType: 'helm',
        selectedServiceSubType: search.template ?? 'current',
      })

      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: {
          organizationId,
          projectId,
          environmentId,
        },
      })
    } catch {
      // errors are surfaced by mutation notifications
    } finally {
      setSubmitMode(null)
    }
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[44rem]">
      <HelmSummaryView
        generalData={generalData}
        valuesOverrideFileData={valuesOverrideFileData}
        valuesOverrideArgumentsData={valuesOverrideArgumentsData}
        helmRepositories={helmRepositories}
        labelsGroup={labelsGroup}
        annotationsGroup={annotationsGroup}
        onEditGeneral={() => navigate({ to: `${creationFlowUrl}/general`, search })}
        onEditValuesOverrideFile={() => navigate({ to: `${creationFlowUrl}/values-override-file`, search })}
        onEditValuesOverrideArguments={() => navigate({ to: `${creationFlowUrl}/values-override-arguments`, search })}
        onBack={() => navigate({ to: `${creationFlowUrl}/values-override-arguments`, search })}
        onSubmit={handleSubmit}
        isLoadingCreate={submitMode === 'create'}
        isLoadingCreateAndDeploy={submitMode === 'create-and-deploy'}
      />
    </FunnelFlowBody>
  )
}
