import {
  type ApplicationDeploymentRestriction,
  type ApplicationDeploymentRestrictionRequest,
  DeploymentRestrictionModeEnum,
  DeploymentRestrictionTypeEnum,
} from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import CrudModal from '../../../ui/page-settings-deployment-restrictions/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  deploymentRestriction?: ApplicationDeploymentRestriction
  onClose: () => void
  onSubmit: (payload: ApplicationDeploymentRestrictionRequest) => void
  isLoading: boolean
}
export function CrudModalFeature({ deploymentRestriction, onClose, onSubmit, isLoading }: CrudModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      mode: deploymentRestriction?.mode ?? DeploymentRestrictionModeEnum.EXCLUDE,
      type: deploymentRestriction?.type ?? DeploymentRestrictionTypeEnum.PATH,
      value: deploymentRestriction?.value ?? '',
    },
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((data) => onSubmit(data))

  return (
    <FormProvider {...methods}>
      <CrudModal onClose={onClose} onSubmit={handleSubmit} isEdit={!!deploymentRestriction} isLoading={isLoading} />
    </FormProvider>
  )
}
export default CrudModalFeature
