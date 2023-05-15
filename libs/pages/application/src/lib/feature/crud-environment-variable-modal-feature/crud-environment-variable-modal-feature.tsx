import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useActionRedeployEnvironment } from '@qovery/domains/environment'
import { getEnvironmentVariablesState } from '@qovery/domains/environment-variable'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { EnvironmentVariableEntity, EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { computeAvailableScope, getEnvironmentVariableFileMountPath } from '@qovery/shared/utils'
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
  isFile?: boolean
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
  mountPath?: string
}

export function CrudEnvironmentVariableModalFeature(props: CrudEnvironmentVariableModalFeatureProps) {
  const { variable, mode, type, isFile = false } = props
  const dispatch = useDispatch<AppDispatch>()
  const errorEnvironmentVariable = useSelector<RootState, string | null | undefined>(
    (state) => getEnvironmentVariablesState(state).error
  )
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()

  const actionRedeployEnvironment = useActionRedeployEnvironment(props.projectId, props.environmentId)

  useEffect(() => {
    if (closing && !errorEnvironmentVariable) props.closeModal()
    setClosing(false)
  }, [closing, errorEnvironmentVariable, props])

  const methods = useForm<DataFormEnvironmentVariableInterface>({
    defaultValues: {
      key: variable?.key,
      scope: variable?.scope === APIVariableScopeEnum.BUILT_IN ? undefined : variable?.scope,
      value: (variable as EnvironmentVariableEntity)?.value,
      isSecret: variable?.variable_kind === 'secret',
      mountPath: getEnvironmentVariableFileMountPath(variable),
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (props.serviceType) {
      const cloneData = { ...data }
      if (!isFile) {
        delete cloneData.mountPath
      }
      handleSubmitForEnvSecretCreation(cloneData, setLoading, props, dispatch, setClosing, props.serviceType, () =>
        actionRedeployEnvironment.mutate()
      )
    }
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  const computeTitle = (): string => {
    let title = ''
    if (mode === EnvironmentVariableCrudMode.CREATION && type === EnvironmentVariableType.NORMAL) {
      title = 'New'
    } else if (mode === EnvironmentVariableCrudMode.EDITION) {
      title =
        'Edit ' +
        (type === EnvironmentVariableType.ALIAS ? 'alias' : type === EnvironmentVariableType.OVERRIDE ? 'override' : '')
    } else if (mode === EnvironmentVariableCrudMode.CREATION) {
      title =
        'Create ' +
        (type === EnvironmentVariableType.ALIAS ? 'alias' : type === EnvironmentVariableType.OVERRIDE ? 'override' : '')
    }

    title += ' variable' + (isFile ? ' file' : '')

    return title
  }

  const computeDescription = (): string => {
    switch (props.type) {
      case EnvironmentVariableType.ALIAS:
        return 'Aliases allow you to specify a different name for a variable on a specific scope.'
      case EnvironmentVariableType.OVERRIDE:
        return 'Overrides allow you to define a different env var value on a specific scope.'
      default:
        if (isFile) {
          return 'The content of the Value field will be mounted as a file in the specified “Path”. Accessing the environment variable at runtime will return the “Path” of the file.'
        }
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
        parentVariableName={variable?.key}
        isFile={isFile}
      />
    </FormProvider>
  )
}

export default CrudEnvironmentVariableModalFeature
