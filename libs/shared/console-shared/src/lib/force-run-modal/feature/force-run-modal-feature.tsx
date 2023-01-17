import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { selectApplicationById } from '@qovery/domains/application'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'
import ForceRunModal from '../ui/force-run-modal'

export interface ForceRunModalFeatureProps {
  applicationId: string
}

export function ForceRunModalFeature(props: ForceRunModalFeatureProps) {
  const application = useSelector<RootState, ApplicationEntity | undefined>((state: RootState) =>
    selectApplicationById(state, props.applicationId)
  )
  const { closeModal } = useModal()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      selected: undefined,
    },
  })

  const onSubmit = methods.handleSubmit(() => {})

  return (
    <FormProvider {...methods}>
      <ForceRunModal application={application} closeModal={closeModal} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default ForceRunModalFeature
