import { ServicePortPorts } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { editApplication, postApplicationActionsRestart } from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch } from '@console/store/data'
import CrudModal from '../../../ui/page-settings-ports/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  port?: ServicePortPorts
  application?: ApplicationEntity
  onClose: () => void
}

export const handleSubmit = (data: FieldValues, application: ApplicationEntity, currentPort?: ServicePortPorts) => {
  const cloneApplication = Object.assign({}, application)

  const ports: ServicePortPorts[] | [] = cloneApplication.ports || []

  const port = {
    internal_port: parseInt(data['internal_port'], 10),
    external_port: parseInt(data['external_port'], 10),
    publicly_accessible: data['publicly_accessible'],
  }

  if (currentPort) {
    cloneApplication.ports = application.ports?.map((p: ServicePortPorts) => {
      if (p.id === currentPort.id) {
        return port
      } else {
        return p
      }
    })
  } else {
    cloneApplication.ports = [...ports, port]
  }

  return cloneApplication
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)

  const methods = useForm({
    defaultValues: {
      internal_port: props.port ? props.port.internal_port : null,
      external_port: props.port ? props.port.external_port : null,
      publicly_accessible: props.port ? props.port.publicly_accessible : false,
    },
    mode: 'onChange',
  })
  const dispatch = useDispatch<AppDispatch>()

  const toasterCallback = () => {
    dispatch(
      postApplicationActionsRestart({
        applicationId: props.application?.id || '',
        environmentId: props.application?.environment?.id || '',
      })
    )
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) return

    setLoading(true)
    const cloneApplication = handleSubmit(data, props.application, props.port)

    dispatch(
      editApplication({
        applicationId: props.application.id,
        data: cloneApplication,
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

  return (
    <FormProvider {...methods}>
      <CrudModal
        port={props.port}
        onSubmit={onSubmit}
        onClose={props.onClose}
        loading={loading}
        isEdit={!!props.port}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
