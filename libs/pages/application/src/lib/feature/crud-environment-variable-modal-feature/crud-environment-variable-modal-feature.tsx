import { useQueryClient } from '@tanstack/react-query'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useActionRedeployEnvironment } from '@qovery/domains/environment'
import { getEnvironmentVariablesState } from '@qovery/domains/environment-variable'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { type EnvironmentVariableEntity, type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { computeAvailableScope, getEnvironmentVariableFileMountPath } from '@qovery/shared/util-js'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import CrudEnvironmentVariableModal from '../../ui/crud-environment-variable-modal/crud-environment-variable-modal'
import { handleSubmitForEnvSecretCreation } from './handle-submit/handle-submit'

export interface CrudEnvironmentVariableModalFeatureProps {
  variable?: EnvironmentVariableSecretOrPublic
  mode: EnvironmentVariableCrudMode
  type?: EnvironmentVariableType
  closeModal: () => void
  organizationId: string
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
  const {
    variable,
    mode,
    type,
    isFile = false,
    organizationId,
    projectId,
    environmentId,
    applicationId,
    closeModal,
    serviceType,
  } = props
  const dispatch = useDispatch<AppDispatch>()
  const errorEnvironmentVariable = useSelector<RootState, string | null | undefined>(
    (state) => getEnvironmentVariablesState(state).error
  )
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const actionRedeployEnvironment = useActionRedeployEnvironment(projectId, environmentId, false, undefined, () =>
    navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId))
  )

  useEffect(() => {
    if (closing && !errorEnvironmentVariable) closeModal()
    setClosing(false)
  }, [closing, errorEnvironmentVariable, closeModal])

  const availableScopes = computeAvailableScope(
    variable?.scope,
    false,
    serviceType,
    type === EnvironmentVariableType.OVERRIDE
  )
  const defaultScope =
    variable?.scope === APIVariableScopeEnum.BUILT_IN
      ? undefined
      : mode === EnvironmentVariableCrudMode.CREATION && type === EnvironmentVariableType.OVERRIDE
      ? availableScopes[0]
      : variable?.scope

  const methods = useForm<DataFormEnvironmentVariableInterface>({
    defaultValues: {
      key: variable?.key,
      scope: defaultScope,
      value: (variable as EnvironmentVariableEntity)?.value,
      isSecret: variable?.variable_kind === 'secret',
      mountPath: getEnvironmentVariableFileMountPath(variable),
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (serviceType) {
      const cloneData = { ...data }

      // allow empty variable value
      if (!cloneData.value) cloneData.value = ''

      if (!isFile) {
        delete cloneData.mountPath
      }
      handleSubmitForEnvSecretCreation(
        cloneData,
        setLoading,
        props,
        dispatch,
        setClosing,
        serviceType,
        () => actionRedeployEnvironment.mutate(),
        () =>
          navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)),
        queryClient
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
    switch (type) {
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
        closeModal={closeModal}
        type={type}
        availableScopes={availableScopes}
        loading={loading}
        parentVariableName={variable?.key}
        isFile={isFile}
      />
    </FormProvider>
  )
}

export default CrudEnvironmentVariableModalFeature
