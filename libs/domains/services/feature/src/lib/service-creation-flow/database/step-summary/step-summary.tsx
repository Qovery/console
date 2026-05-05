import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import posthog from 'posthog-js'
import {
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useCreateService } from '../../../hooks/use-create-service/use-create-service'
import { useDeployService } from '../../../hooks/use-deploy-service/use-deploy-service'
import {
  type DatabaseCreateGeneralData,
  type DatabaseCreateResourcesData,
  buildDatabaseCreatePayload,
} from '../database-create-utils/database-create-utils'
import { databaseCreationSteps, useDatabaseCreateContext } from '../database-creation-flow'
import { DatabaseSummaryView } from '../database-summary-view/database-summary-view'

export interface DatabaseStepSummaryProps {
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

export function DatabaseStepSummary({ labelsGroup, annotationsGroup }: DatabaseStepSummaryProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const { creationFlowUrl, generalForm, resourcesForm, setCurrentStep } = useDatabaseCreateContext()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)
  const { mutateAsync: createService } = useCreateService({ organizationId })
  const { mutateAsync: deployService } = useDeployService({ organizationId, projectId, environmentId })

  const generalData = generalForm.getValues() as DatabaseCreateGeneralData
  const resourcesData = resourcesForm.getValues() as DatabaseCreateResourcesData

  useEffect(() => {
    setCurrentStep(databaseCreationSteps.length)
  }, [setCurrentStep])

  useEffect(() => {
    if (!generalData.name || !generalData.type || !generalData.version || !generalData.mode) {
      navigate({ to: `${creationFlowUrl}/general`, search })
    }
  }, [creationFlowUrl, generalData.mode, generalData.name, generalData.type, generalData.version, navigate, search])

  const handleSubmit = async (withDeploy: boolean) => {
    setSubmitMode(withDeploy ? 'create-and-deploy' : 'create')

    try {
      const payload = buildDatabaseCreatePayload({
        generalData,
        resourcesData,
        labelsGroup,
        annotationsGroup,
      })

      const service = await createService({
        environmentId,
        payload: {
          serviceType: 'DATABASE',
          ...payload,
        },
      })

      if (withDeploy) {
        await deployService({
          serviceId: service.id,
          serviceType: 'DATABASE',
        })
      }

      posthog.capture('create-service', {
        selectedServiceType: search.template ?? 'database',
        selectedServiceSubType: search.option ?? 'current',
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
    <FunnelFlowBody>
      <DatabaseSummaryView
        generalData={generalData}
        resourcesData={resourcesData}
        labelsGroup={labelsGroup}
        annotationsGroup={annotationsGroup}
        onEditGeneral={() => navigate({ to: `${creationFlowUrl}/general`, search })}
        onEditResources={() => navigate({ to: `${creationFlowUrl}/resources`, search })}
        onBack={() => navigate({ to: `${creationFlowUrl}/resources`, search })}
        onSubmit={handleSubmit}
        isLoadingCreate={submitMode === 'create'}
        isLoadingCreateAndDeploy={submitMode === 'create-and-deploy'}
      />
    </FunnelFlowBody>
  )
}

export default DatabaseStepSummary
