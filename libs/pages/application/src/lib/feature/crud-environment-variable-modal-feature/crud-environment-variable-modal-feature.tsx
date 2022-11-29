import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { getEnvironmentVariablesState } from '@qovery/domains/environment-variable'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { EnvironmentVariableEntity, EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import CrudEnvironmentVariableModal from '../../ui/crud-environment-variable-modal/crud-environment-variable-modal'
import { handleSubmitForEnvSecretCreation } from './handle-submit/handle-submit'

export interface CrudEnvironmentVariableModalFeatureProps {
  variable?: EnvironmentVariableSecretOrPublic
  mode: EnvironmentVariableCrudMode
  type?: EnvironmentVariableType
  closeModal: () => void
  applicationId: string
  environmentId: string
  projectId: string
  serviceType?: ServiceTypeEnum
}

export enum EnvironmentVariableCrudMode {
  CREATION = 'CREATION',
  EDITION = 'EDITION',
}

export enum EnvironmentVariableType {
  NORMAL = 'NORMAL',
  OVERRIDE = 'OVERRIDE',
  ALIAS = 'ALIAS',
}

export interface DataFormEnvironmentVariableInterface {
  key: string
  value: string
  scope: string
  isSecret: boolean
}

export function CrudEnvironmentVariableModalFeature(props: CrudEnvironmentVariableModalFeatureProps) {
  const { variable, mode, type } = props
  const dispatch = useDispatch<AppDispatch>()
  const errorEnvironmentVariable = useSelector<RootState, string | null | undefined>(
    (state) => getEnvironmentVariablesState(state).error
  )
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    if (closing && !errorEnvironmentVariable) props.closeModal()
    setClosing(false)
  }, [closing, errorEnvironmentVariable, props])

  const methods = useForm<DataFormEnvironmentVariableInterface>({
    defaultValues: {
      key: variable?.key,
      scope: variable?.scope === APIVariableScopeEnum.BUILT_IN ? undefined : variable?.scope,
      value: (variable as EnvironmentVariableEntity)?.value,
      isSecret: variable?.variable_type === 'secret',
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(
    (data) =>
      props.serviceType &&
      handleSubmitForEnvSecretCreation(data, setLoading, props, dispatch, setClosing, props.serviceType)
  )

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  const computeTitle = (): string => {
    if (mode === EnvironmentVariableCrudMode.CREATION && type === EnvironmentVariableType.NORMAL) {
      return 'New variable'
    } else if (mode === EnvironmentVariableCrudMode.EDITION) {
      return (
        'Edit ' +
        (type === EnvironmentVariableType.ALIAS
          ? 'alias'
          : type === EnvironmentVariableType.OVERRIDE
          ? 'override'
          : 'variable')
      )
    } else if (mode === EnvironmentVariableCrudMode.CREATION) {
      return (
        'Create ' +
        (type === EnvironmentVariableType.ALIAS
          ? 'alias'
          : type === EnvironmentVariableType.OVERRIDE
          ? 'override'
          : 'variable')
      )
    }

    return ''
  }

  const computeDescription = (): string => {
    switch (props.type) {
      case EnvironmentVariableType.ALIAS:
        return 'Aliases allow you to specify a different name for a variable on a specific scope.'
      case EnvironmentVariableType.OVERRIDE:
        return 'Overrides allow you to define a different env var value on a specific scope.'
      default:
        return 'Variable are used at build/run time. Secrets are special variables, their value can only be accessed by the application.'
    }
  }

  return (
    <FormProvider {...methods}>
      <CrudEnvironmentVariableModal
        mode={mode}
        title={computeTitle()}
        description={computeDescription()}
        onSubmit={onSubmit}
        closeModal={props.closeModal}
        type={props.type}
        availableScopes={computeAvailableScope(variable?.scope, false, props.serviceType)}
        loading={loading}
      />
    </FormProvider>
  )
}

export default CrudEnvironmentVariableModalFeature
