import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import posthog from 'posthog-js'
import {
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useImportVariables } from '@qovery/domains/variables/feature'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { buildHpaAdvancedSettingsPayload } from '@qovery/shared/util-services'
import { useCreateService } from '../../../../hooks/use-create-service/use-create-service'
import { useDeployService } from '../../../../hooks/use-deploy-service/use-deploy-service'
import { useEditAdvancedSettings } from '../../../../hooks/use-edit-advanced-settings/use-edit-advanced-settings'
import { steps, useApplicationContainerCreateContext } from '../../application-container-creation-flow'
import {
  buildApplicationContainerCreatePayload,
  prepareVariableImportRequest,
} from '../application-container-summary-utils/application-container-summary-utils'
import { ApplicationContainerSummaryView } from '../application-container-summary-view/application-container-summary-view'

export interface ApplicationContainerStepSummaryProps {
  selectedRegistryName?: string
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
}

export function ApplicationContainerStepSummary({
  selectedRegistryName,
  annotationsGroup,
  labelsGroup,
}: ApplicationContainerStepSummaryProps) {
  const { organizationId = '', projectId = '', environmentId = '', slug = '' } = useParams({ strict: false })
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const { creationFlowUrl, generalForm, resourcesForm, portForm, variablesForm, setCurrentStep } =
    useApplicationContainerCreateContext()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)

  const generalData = generalForm.getValues()
  const resourcesData = resourcesForm.getValues()
  const portData = portForm.getValues()
  const variablesData = variablesForm.getValues().variables

  const { mutateAsync: createService } = useCreateService({ organizationId })
  const { mutateAsync: importVariables } = useImportVariables()
  const { mutateAsync: deployService } = useDeployService({ organizationId, projectId, environmentId })
  const { mutateAsync: editAdvancedSettings } = useEditAdvancedSettings({
    organizationId,
    projectId,
    environmentId,
  })

  useEffect(() => {
    setCurrentStep(steps.length)
  }, [setCurrentStep])

  useEffect(() => {
    if (!generalData.name) {
      navigate({ to: `${creationFlowUrl}/general`, search })
    }
  }, [creationFlowUrl, generalData.name, navigate, search])

  const createPayload = useMemo(
    () =>
      buildApplicationContainerCreatePayload({
        generalData,
        resourcesData,
        portData,
        labelsGroup,
        annotationsGroup,
      }),
    [annotationsGroup, generalData, labelsGroup, portData, resourcesData]
  )

  const goToStep = (step: 'general' | 'resources' | 'ports' | 'health-checks' | 'variables') => {
    navigate({ to: `${creationFlowUrl}/${step}`, search })
  }

  const handleSubmit = async (withDeploy: boolean) => {
    setSubmitMode(withDeploy ? 'create-and-deploy' : 'create')

    try {
      const service = await match(createPayload)
        .with({ serviceType: 'APPLICATION' }, ({ payload }) =>
          createService({
            environmentId,
            payload: {
              serviceType: 'APPLICATION',
              ...payload,
            },
          })
        )
        .with({ serviceType: 'CONTAINER' }, ({ payload }) =>
          createService({
            environmentId,
            payload: {
              serviceType: 'CONTAINER',
              ...payload,
            },
          })
        )
        .exhaustive()

      const variableImportRequest = prepareVariableImportRequest(variablesData)
      if (variableImportRequest) {
        await importVariables({
          serviceType: createPayload.serviceType,
          serviceId: service.id,
          variableImportRequest,
        })
      }

      if (resourcesData.autoscaling_mode === 'HPA') {
        await editAdvancedSettings({
          serviceId: service.id,
          payload: {
            serviceType: createPayload.serviceType,
            ...buildHpaAdvancedSettingsPayload(resourcesData as unknown as Record<string, unknown>, {}),
          },
        })
      }

      if (withDeploy) {
        await deployService({
          serviceId: service.id,
          serviceType: createPayload.serviceType,
        })
      }

      posthog.capture('create-service', {
        selectedServiceType: slug,
        selectedServiceSubType: search.option ?? search.template ?? slug,
      })

      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId',
        params: {
          organizationId,
          projectId,
          environmentId,
          serviceId: service.id,
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
      <ApplicationContainerSummaryView
        generalData={generalData}
        resourcesData={resourcesData}
        portsData={portData}
        variablesData={variablesData}
        selectedRegistryName={selectedRegistryName}
        annotationsGroup={annotationsGroup}
        labelsGroup={labelsGroup}
        onEditGeneral={() => goToStep('general')}
        onEditResources={() => goToStep('resources')}
        onEditPorts={() => goToStep('ports')}
        onEditHealthchecks={() => goToStep('health-checks')}
        onEditVariables={() => goToStep('variables')}
        onBack={() => goToStep('variables')}
        onSubmit={handleSubmit}
        isLoadingCreate={submitMode === 'create'}
        isLoadingCreateAndDeploy={submitMode === 'create-and-deploy'}
      />
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepSummary
