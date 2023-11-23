import { useQueryClient } from '@tanstack/react-query'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { postApplicationActionsRedeploy } from '@qovery/domains/application'
import { useActionRedeployEnvironment } from '@qovery/domains/environment'
import {
  useCreateVariable,
  useCreateVariableAlias,
  useCreateVariableOverride,
  useEditVariable,
} from '@qovery/domains/variables/feature'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { ToastEnum, toast, useModal } from '@qovery/shared/ui'
import { computeAvailableScope, getEnvironmentVariableFileMountPath } from '@qovery/shared/util-js'
import { type AppDispatch } from '@qovery/state/store'
import CrudEnvironmentVariableModal from '../../ui/crud-environment-variable-modal/crud-environment-variable-modal'

export interface CrudEnvironmentVariableModalFeatureProps {
  variable?: EnvironmentVariableSecretOrPublic
  mode: EnvironmentVariableCrudMode
  type: EnvironmentVariableType
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
  const [loading, setLoading] = useState(false)
  const { enableAlertClickOutside } = useModal()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const actionRedeployEnvironment = useActionRedeployEnvironment(projectId, environmentId, false, undefined, () =>
    navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId))
  )

  const { mutateAsync: createVariable } = useCreateVariable()
  const { mutateAsync: createVariableAlias } = useCreateVariableAlias()
  const { mutateAsync: createVariableOverride } = useCreateVariableOverride()
  const { mutateAsync: editVariable } = useEditVariable()

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
      value: variable?.value ?? '',
      isSecret: variable?.value === null,
      mountPath: getEnvironmentVariableFileMountPath(variable),
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (serviceType) {
      const cloneData = { ...data }

      // allow empty variable value
      if (!cloneData.value) cloneData.value = ''

      if (!isFile) {
        delete cloneData.mountPath
      }

      try {
        const parentId = match(data)
          .with({ scope: APIVariableScopeEnum.ENVIRONMENT }, () => props.environmentId)
          .with({ scope: APIVariableScopeEnum.PROJECT }, () => props.projectId)
          .with(
            { scope: APIVariableScopeEnum.APPLICATION },
            { scope: APIVariableScopeEnum.CONTAINER },
            { scope: APIVariableScopeEnum.JOB },
            () => props.applicationId
          )
          .otherwise(() => '')

        setLoading(true)

        await match(props)
          .with({ mode: EnvironmentVariableCrudMode.CREATION, type: EnvironmentVariableType.NORMAL }, () =>
            createVariable({
              variableRequest: {
                is_secret: data.isSecret,
                key: data.key,
                value: data.value,
                mount_path: data.mountPath || null,
                variable_parent_id: parentId,
                variable_scope: data.scope as APIVariableScopeEnum,
              },
            })
          )
          .with({ mode: EnvironmentVariableCrudMode.CREATION, type: EnvironmentVariableType.ALIAS }, () => {
            if (!props.variable) {
              // TODO: Fix props type for this case to be impossible
              throw new Error('No variable to be based on')
            }
            return createVariableAlias({
              variableId: props.variable.id,
              variableAliasRequest: {
                alias_scope: data.scope as APIVariableScopeEnum,
                alias_parent_id: parentId,
                key: data.key,
              },
            })
          })
          .with({ mode: EnvironmentVariableCrudMode.CREATION, type: EnvironmentVariableType.OVERRIDE }, () => {
            if (!props.variable) {
              // TODO: Fix props type for this case to be impossible
              throw new Error('No variable to be based on')
            }
            return createVariableOverride({
              variableId: props.variable.id,
              variableOverrideRequest: {
                override_scope: data.scope as APIVariableScopeEnum,
                override_parent_id: parentId,
                value: data.value,
              },
            })
          })
          .with({ mode: EnvironmentVariableCrudMode.EDITION }, () => {
            if (!props.variable) {
              // TODO: Fix props type for this case to be impossible
              throw new Error('No variable to be based on')
            }

            return editVariable({
              variableId: props.variable.id,
              variableEditRequest: {
                key: data.key,
                value: props.variable.aliased_variable?.key || data.value || '',
              },
            })
          })
          .exhaustive()

        const toasterCallback = () => {
          if (
            data.scope === APIVariableScopeEnum.JOB ||
            data.scope === APIVariableScopeEnum.CONTAINER ||
            data.scope === APIVariableScopeEnum.APPLICATION
          ) {
            dispatch(
              postApplicationActionsRedeploy({
                applicationId: props.applicationId,
                environmentId: props.environmentId,
                serviceType: serviceType,
                callback: () =>
                  navigate(
                    ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
                  ),
                queryClient,
              })
            )
          } else {
            actionRedeployEnvironment.mutate()
          }
        }

        const toasterInfo = match(props.mode)
          .with(
            EnvironmentVariableCrudMode.CREATION,
            () => ['Creation success', 'You need to redeploy your environment for your changes to be applied.'] as const
          )
          .with(
            EnvironmentVariableCrudMode.EDITION,
            () => ['Edition success', 'You need to redeploy your environment for your changes to be applied.'] as const
          )
          .exhaustive()

        toast(ToastEnum.SUCCESS, toasterInfo[0], toasterInfo[1], toasterCallback, undefined, 'Redeploy')

        closeModal()
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
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
