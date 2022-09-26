import { ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAvailableContainerRegistry,
  selectAvailableContainerRegistry,
  selectAvailableContainerRegistryLoadingStatus,
} from '@qovery/domains/organization'
// import { editApplication, postApplicationActionsRestart } from '@qovery/domains/application'
import { AppDispatch, RootState } from '@qovery/store/data'
import CrudModal from '../../../ui/page-organization-container-registries/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  registry?: ContainerRegistryResponse
  onClose: () => void
}

// export const handleSubmit = (data: FieldValues, application: ApplicationEntity, currentPort?: ServicePort) => {
//   const cloneApplication = Object.assign({}, application)

//   return cloneApplication
// }

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)

  const methods = useForm({
    defaultValues: {
      name: props.registry ? props.registry.name : undefined,
      description: props.registry ? props.registry.description : undefined,
      url: props.registry ? props.registry.url : undefined,
      kind: props.registry ? props.registry?.kind : undefined,
    },
    mode: 'onChange',
  })

  const availableContainerRegistry = useSelector((state: RootState) => selectAvailableContainerRegistry(state))
  const availableContainerRegistryLoadingStatus = useSelector((state: RootState) =>
    selectAvailableContainerRegistryLoadingStatus(state)
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (availableContainerRegistryLoadingStatus !== 'loaded') dispatch(fetchAvailableContainerRegistry())
  }, [dispatch, availableContainerRegistryLoadingStatus])

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    console.log(data)
    // const cloneApplication = handleSubmit(data, props.application, props.port)

    // dispatch(
    //   editApplication({
    //     applicationId: props.application.id,
    //     data: cloneApplication,
    //     serviceType: getServiceType(props.application),
    //     toasterCallback,
    //   })
    // )
    //   .unwrap()
    //   .then(() => {
    //     setLoading(false)
    //     props.onClose()
    //   })
    //   .catch((e) => {
    //     setLoading(false)
    //     console.error(e)
    //   })
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        registry={props.registry}
        availableContainerRegistry={availableContainerRegistry}
        onSubmit={onSubmit}
        onClose={props.onClose}
        loading={loading}
        isEdit={!!props.registry}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
