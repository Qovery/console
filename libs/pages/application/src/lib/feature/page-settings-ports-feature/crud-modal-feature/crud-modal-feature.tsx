import { CustomDomain } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { getApplicationsState } from '@console/domains/application'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'
import CrudModal from '../../../ui/page-settings-domains/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  customDomain?: CustomDomain
  application?: ApplicationEntity
  onClose: () => void
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const methods = useForm({
    defaultValues: { domain: props.customDomain ? props.customDomain.domain : '' },
    mode: 'onChange',
  })
  // const dispatch = useDispatch<AppDispatch>()
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => getApplicationsState(state).loadingStatus)

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) return

    // return
    // dispatch()
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        customDomain={props.customDomain}
        onSubmit={onSubmit}
        onClose={props.onClose}
        loading={loadingStatus === 'loading'}
        isEdit={!!props.customDomain}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
