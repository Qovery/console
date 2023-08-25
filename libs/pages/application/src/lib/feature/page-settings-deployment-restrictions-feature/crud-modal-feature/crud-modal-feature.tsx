import {
  type ApplicationDeploymentRestriction,
  DeploymentRestrictionModeEnum,
  DeploymentRestrictionTypeEnum,
} from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { type ApplicationType } from '@qovery/domains/services/data-access'
import { useCreateDeploymentRestriction, useEditDeploymentRestriction } from '@qovery/domains/services/feature'
import CrudModal from '../../../ui/page-settings-deployment-restrictions/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  deploymentRestriction?: ApplicationDeploymentRestriction
  onClose: () => void
  serviceId: string
  serviceType: ApplicationType
}
export function CrudModalFeature({ deploymentRestriction, serviceId, serviceType, onClose }: CrudModalFeatureProps) {
  const serviceParams = {
    serviceId,
    serviceType,
  }
  const { mutate: createRestriction, isLoading: isCreateRestrictionLoading } =
    useCreateDeploymentRestriction(serviceParams)
  const { mutate: editRestriction, isLoading: isEditRestrictionLoading } = useEditDeploymentRestriction(serviceParams)
  const methods = useForm({
    defaultValues: {
      mode: deploymentRestriction?.mode ?? DeploymentRestrictionModeEnum.EXCLUDE,
      type: deploymentRestriction?.type ?? DeploymentRestrictionTypeEnum.PATH,
      value: deploymentRestriction?.value ?? '',
    },
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((payload) => {
    if (deploymentRestriction) {
      editRestriction({
        ...serviceParams,
        deploymentRestrictionId: deploymentRestriction.id,
        payload,
      })
    } else {
      createRestriction({
        ...serviceParams,
        payload,
      })
    }
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        onClose={onClose}
        onSubmit={handleSubmit}
        isEdit={!!deploymentRestriction}
        isLoading={isCreateRestrictionLoading || isEditRestrictionLoading}
      />
    </FormProvider>
  )
}
export default CrudModalFeature
