import { type ClusterRoutingTableResults } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { editClusterRoutingTable, postClusterActionsDeploy } from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'
import CrudModal from '../../../ui/page-settings-network/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  route?: ClusterRoutingTableResults
  routes?: ClusterRoutingTableResults[]
  organizationId: string
  clusterId: string
  onClose: () => void
}

export const handleSubmit = (
  data: FieldValues,
  routes: ClusterRoutingTableResults[] = [],
  currentRoute?: ClusterRoutingTableResults
) => {
  let currentRoutes = [...routes]

  if (currentRoute) {
    currentRoutes = currentRoutes.filter((route) => route.destination !== data['destination'])
  }

  return [
    ...currentRoutes,
    {
      destination: data['destination'],
      target: data['target'],
      description: data['description'],
    },
  ]
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()

  const methods = useForm({
    defaultValues: {
      destination: props.route ? props.route.destination : undefined,
      target: props.route ? props.route.target : undefined,
      description: props.route ? props.route.description : undefined,
    },
    mode: 'onChange',
  })
  const dispatch = useDispatch<AppDispatch>()

  const toasterCallback = () => {
    dispatch(
      postClusterActionsDeploy({
        organizationId: props.organizationId,
        clusterId: props.clusterId,
      })
    )
  }

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)
    const cloneRoutingTable = handleSubmit(data, props.routes, props.route)

    dispatch(
      editClusterRoutingTable({
        clusterId: props.clusterId,
        organizationId: props.clusterId,
        routes: cloneRoutingTable,
        toasterCallback,
      })
    )
      .unwrap()
      .then(() => {
        setLoading(false)
        props.onClose()
      })
      .catch((e) => {
        setLoading(false)
        console.error(e)
      })
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  return (
    <FormProvider {...methods}>
      <CrudModal
        route={props.route}
        onSubmit={onSubmit}
        onClose={props.onClose}
        loading={loading}
        isEdit={!!props.route}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
