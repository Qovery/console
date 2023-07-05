import { ServicePort } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { editApplication, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { CrudModal, defaultLivenessProbe } from '@qovery/shared/console-shared'
import { ProbeTypeEnum, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'

export interface CrudModalFeatureProps {
  onClose: () => void
  application?: ApplicationEntity
  port?: ServicePort
  isSetting?: boolean
}

export const handleSubmit = (data: FieldValues, application: ApplicationEntity, currentPort?: ServicePort) => {
  const cloneApplication = Object.assign({}, application)

  const ports: ServicePort[] | [] = cloneApplication.ports || []

  const port = {
    internal_port: parseInt(data['internal_port'], 10),
    external_port: parseInt(data['external_port'], 10),
    publicly_accessible: data['publicly_accessible'],
    name: data['name'],
  }

  if (currentPort) {
    cloneApplication.ports = application.ports?.map((p: ServicePort) => {
      if (p.id === currentPort.id) {
        return port
      } else {
        return p
      }
    }) as ServicePort[]
  } else {
    cloneApplication.ports = [...ports, port] as ServicePort[]
  }

  if (ports.length === 0) {
    cloneApplication.healthchecks = {
      liveness_probe: {
        type: {
          [ProbeTypeEnum.TCP.toLowerCase()]: {
            port: port.internal_port,
            host: null,
          },
        },
        ...defaultLivenessProbe,
      },
    }
  }

  return cloneApplication
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()

  const methods = useForm({
    defaultValues: {
      internal_port: props.port ? props.port.internal_port : undefined,
      external_port: props.port ? props.port.external_port : undefined,
      publicly_accessible: props.port ? props.port.publicly_accessible : false,
      name: props.port ? props.port.name : undefined,
    },
    mode: 'onChange',
  })
  const dispatch = useDispatch<AppDispatch>()

  const toasterCallback = () => {
    if (props.application) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId: props.application?.id || '',
          environmentId: props.application?.environment?.id || '',
          serviceType: getServiceType(props.application),
        })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) return

    setLoading(true)
    const cloneApplication = handleSubmit(data, props.application, props.port)

    dispatch(
      editApplication({
        applicationId: props.application.id,
        data: cloneApplication,
        serviceType: getServiceType(props.application),
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
        isSetting={props.isSetting}
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
