import { type Environment } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchApplications } from '@qovery/domains/application'
import { fetchDatabases } from '@qovery/domains/database'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { useCloneService } from '@qovery/domains/services/feature'
import { selectProjectsEntitiesByOrgId } from '@qovery/project'
import { ServiceTypeEnum, getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { APPLICATION_GENERAL_URL, APPLICATION_URL, DATABASE_GENERAL_URL, DATABASE_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import CloneServiceModal from '../ui/clone-service-modal'

export interface CloneServiceModalFeatureProps {
  onClose: () => void
  organizationId: string
  projectId: string
  serviceToClone: ApplicationEntity | DatabaseEntity
}

export function CloneServiceModalFeature({
  onClose,
  organizationId,
  projectId,
  serviceToClone,
}: CloneServiceModalFeatureProps) {
  const dispatch: AppDispatch = useDispatch()
  const { enableAlertClickOutside } = useModal()
  const { mutateAsync, isLoading: isCloneServiceLoading } = useCloneService()
  const projects = useSelector((state: RootState) => selectProjectsEntitiesByOrgId(state, organizationId))

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: serviceToClone.name + '-clone',
      environment: serviceToClone.environment?.id as string,
      project: projectId,
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const selectedProjectId = methods.watch('project')
  const environments: Environment[] = []
  const { data = [], isLoading: isFetchEnvironmentsLoading } = useFetchEnvironments(selectedProjectId)
  // Avoid array ref mutation to prevent re-rendering
  environments.splice(0, environments.length)
  environments.push(...data)

  const navigate = useNavigate()
  const serviceType = getServiceType(serviceToClone)

  const onSubmit = methods.handleSubmit(async ({ name, environment: environmentId, project: projectId }) => {
    const cloneRequest = {
      name,
      environment_id: environmentId,
    }

    const result = await mutateAsync({
      serviceId: serviceToClone.id,
      serviceType,
      cloneRequest,
    })

    if (serviceType === ServiceTypeEnum.DATABASE) {
      dispatch(fetchDatabases({ environmentId }))
      navigate(DATABASE_URL(organizationId, projectId, environmentId, result.id) + DATABASE_GENERAL_URL)
    } else {
      dispatch(fetchApplications({ environmentId }))
      navigate(APPLICATION_URL(organizationId, projectId, environmentId, result.id) + APPLICATION_GENERAL_URL)
    }
    onClose()
  })

  if (!environments) {
    return null
  }

  return (
    <FormProvider {...methods}>
      <CloneServiceModal
        closeModal={onClose}
        environments={environments}
        isFetchEnvironmentsLoading={isFetchEnvironmentsLoading}
        loading={isCloneServiceLoading}
        onSubmit={onSubmit}
        projects={projects}
        serviceToClone={serviceToClone}
        serviceType={serviceType}
      />
    </FormProvider>
  )
}

export default CloneServiceModalFeature
