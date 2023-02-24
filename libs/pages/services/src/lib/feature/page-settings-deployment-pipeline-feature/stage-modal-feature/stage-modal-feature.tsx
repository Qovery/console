import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { getApplicationsState } from '@qovery/domains/application'
import { RootState } from '@qovery/store'
import StageModal from '../../../ui/page-settings-deployment-pipeline/stage-modal/stage-modal'

export interface StageModalFeatureProps {
  environmentId: string
  onClose: () => void
}

// export const handleSubmit = (
//   data: { size: number; type: StorageTypeEnum; mount_point: string },
//   application: ApplicationEntity,
//   storage?: ServiceStorageStorage
// ) => {
//   const app = { ...application }

//   // edit mode
//   if (storage?.id) {
//     const editedStorage: ServiceStorageStorage = { id: storage.id, ...data }
//     app.storage = app.storage?.filter((s) => s.id !== storage.id)
//     app.storage?.push(editedStorage)
//   } else {
//     // creation mode
//     app.storage = [...(app.storage || []), data] as ServiceStorageStorage[]
//   }

//   return app
// }

export function StageModalFeature(props: StageModalFeatureProps) {
  const methods = useForm({
    // defaultValues: {
    //   size: props.storage?.size || 4,
    //   type: props.storage?.type || StorageTypeEnum.FAST_SSD,
    //   mount_point: props.storage?.mount_point || '',
    // },
    mode: 'onChange',
  })

  // const toasterCallback = () => {
  // if (props.application) {
  //   dispatch(
  //     postApplicationActionsRestart({
  //       applicationId: props.application.id,
  //       environmentId: props.application.environment?.id || '',
  //       serviceType: getServiceType(props.application),
  //     })
  //   )
  // }
  // }

  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)
  // const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    // if (!props.application) {
    //   return
    // }
    // const app = handleSubmit(data, props.application, props.storage)
    // dispatch(editApplication({ data: app, applicationId: app.id, serviceType: getServiceType(app), toasterCallback }))
    //   .unwrap()
    //   .then(() => props.onClose())
    //   .catch((e) => console.error(e))
  })

  return (
    <FormProvider {...methods}>
      <StageModal
        onClose={props.onClose}
        onSubmit={onSubmit}
        // isEdit={!!props.storage}
        loading={loadingStatus === 'loading'}
      />
    </FormProvider>
  )
}

export default StageModalFeature
