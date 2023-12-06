import { type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useEditRoutingTable } from '@qovery/domains/clusters/feature'
import { useModal } from '@qovery/shared/ui'
import CrudModal from '../../../ui/page-settings-network/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  route?: ClusterRoutingTableResultsInner
  routes?: ClusterRoutingTableResultsInner[]
  organizationId: string
  clusterId: string
  onClose: () => void
}

export const handleSubmit = (
  data: FieldValues,
  routes: ClusterRoutingTableResultsInner[] = [],
  currentRoute?: ClusterRoutingTableResultsInner
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
  const { enableAlertClickOutside } = useModal()

  const { mutateAsync: editRoutingTable, isLoading: isEditRoutingTableLoading } = useEditRoutingTable()
  const methods = useForm({
    defaultValues: {
      destination: props.route ? props.route.destination : undefined,
      target: props.route ? props.route.target : undefined,
      description: props.route ? props.route.description : undefined,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const cloneRoutingTable = handleSubmit(data, props.routes, props.route)

    try {
      await editRoutingTable({
        clusterId: props.clusterId,
        organizationId: props.organizationId,
        routingTableRequest: { routes: cloneRoutingTable },
      })
      props.onClose()
    } catch (e) {
      console.error(e)
    }
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
        loading={isEditRoutingTableLoading}
        isEdit={!!props.route}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
