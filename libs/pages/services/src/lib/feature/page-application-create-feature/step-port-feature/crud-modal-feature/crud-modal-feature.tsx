import { ServicePort } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { CrudModal } from '@qovery/shared/console-shared'
import { useModal } from '@qovery/shared/ui'

export interface CrudModalFeatureProps {
  port?: ServicePort
  onClose: () => void
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const [loading] = useState(false)
  const { enableAlertClickOutside } = useModal()

  const methods = useForm({
    defaultValues: {
      internal_port: props.port ? props.port.internal_port : null,
      external_port: props.port ? props.port.external_port : null,
      publicly_accessible: props.port ? props.port.publicly_accessible : false,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    console.log(data)
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

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
