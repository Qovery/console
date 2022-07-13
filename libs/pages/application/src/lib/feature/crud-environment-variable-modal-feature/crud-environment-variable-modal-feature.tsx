import { EnvironmentVariableEntity, EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'
import CrudEnvironmentVariableModal from '../../ui/crud-environment-variable-modal/crud-environment-variable-modal'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import {
  createAliasEnvironmentVariables,
  createAliasSecret,
  createEnvironmentVariables,
  createOverrideEnvironmentVariables,
  createOverrideSecret,
  createSecret,
  editEnvironmentVariables,
  editSecret,
  getEnvironmentVariablesState,
} from '@console/domains/environment-variable'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'

export interface CrudEnvironmentVariableModalFeatureProps {
  variable?: EnvironmentVariableSecretOrPublic
  mode: EnvironmentVariableCrudMode
  type?: EnvironmentVariableType
  setOpen: (open: boolean) => void
  applicationId: string
  environmentId: string
  projectId: string
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

export function CrudEnvironmentVariableModalFeature(props: CrudEnvironmentVariableModalFeatureProps) {
  const { variable, mode, type } = props
  const dispatch = useDispatch<AppDispatch>()
  const errorEnvironmentVariable = useSelector<RootState, string | null | undefined>(
    (state) => getEnvironmentVariablesState(state).error
  )
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (closing && !errorEnvironmentVariable) props.setOpen(false)
    setClosing(false)
  }, [closing, errorEnvironmentVariable, props])

  const { handleSubmit, control, formState } = useForm<{
    key: string
    value: string
    scope: string
    isSecret: boolean
  }>({
    defaultValues: {
      key: variable?.key,
      scope: variable?.scope,
      value: (variable as EnvironmentVariableEntity)?.value,
      isSecret: variable?.variable_type === 'secret',
    },
    mode: 'onChange',
  })

  const onSubmit = handleSubmit((data) => {
    if (data) {
      let entityId
      switch (data.scope) {
        case EnvironmentVariableScopeEnum.ENVIRONMENT:
          entityId = props.environmentId
          break
        case EnvironmentVariableScopeEnum.PROJECT:
          entityId = props.projectId
          break
        case EnvironmentVariableScopeEnum.APPLICATION:
        default:
          entityId = props.applicationId
          break
      }

      if (!data.isSecret) {
        if (props.mode === EnvironmentVariableCrudMode.CREATION) {
          switch (props.type) {
            case EnvironmentVariableType.OVERRIDE:
              dispatch(
                createOverrideEnvironmentVariables({
                  entityId,
                  applicationId: props.applicationId,
                  environmentVariableRequest: {
                    value: data.value,
                  },
                  environmentVariableId: variable?.id || '',
                  scope: data.scope as EnvironmentVariableScopeEnum,
                })
              ).then(() => {
                setClosing(true)
              })
              break
            case EnvironmentVariableType.ALIAS:
              dispatch(
                createAliasEnvironmentVariables({
                  entityId,
                  applicationId: props.applicationId,
                  environmentVariableRequest: {
                    key: data.key,
                  },
                  environmentVariableId: variable?.id || '',
                  scope: data.scope as EnvironmentVariableScopeEnum,
                })
              ).then(() => {
                setClosing(true)
              })
              break
            default:
              dispatch(
                createEnvironmentVariables({
                  entityId,
                  applicationId: props.applicationId,
                  environmentVariableRequest: {
                    key: data.key,
                    value: data.value,
                  },
                  scope: data.scope as EnvironmentVariableScopeEnum,
                })
              ).then(() => {
                setClosing(true)
              })
              break
          }
        } else {
          dispatch(
            editEnvironmentVariables({
              entityId,
              environmentVariableId: props.variable?.id || '',
              environmentVariableRequest: {
                key: data.key,
                value: data.value,
              },
              scope: data.scope as EnvironmentVariableScopeEnum,
            })
          ).then(() => {
            setClosing(true)
          })
        }
      } else {
        if (props.mode === EnvironmentVariableCrudMode.CREATION) {
          switch (props.type) {
            case EnvironmentVariableType.OVERRIDE:
              dispatch(
                createOverrideSecret({
                  entityId,
                  applicationId: props.applicationId,
                  environmentVariableRequest: {
                    value: data.value,
                  },
                  environmentVariableId: variable?.id || '',
                  scope: data.scope as EnvironmentVariableScopeEnum,
                })
              ).then(() => {
                setClosing(true)
              })
              break
            case EnvironmentVariableType.ALIAS:
              dispatch(
                createAliasSecret({
                  entityId,
                  applicationId: props.applicationId,
                  environmentVariableRequest: {
                    key: data.key,
                  },
                  environmentVariableId: variable?.id || '',
                  scope: data.scope as EnvironmentVariableScopeEnum,
                })
              ).then(() => {
                setClosing(true)
              })
              break
            default:
              dispatch(
                createSecret({
                  entityId,
                  applicationId: props.applicationId,
                  environmentVariableRequest: {
                    key: data.key,
                    value: data.value,
                  },
                  scope: data.scope as EnvironmentVariableScopeEnum,
                })
              ).then(() => {
                setClosing(true)
              })
              break
          }
        } else {
          dispatch(
            editSecret({
              entityId,
              environmentVariableId: props.variable?.id || '',
              environmentVariableRequest: {
                key: data.key,
                value: data.value,
              },
              scope: data.scope as EnvironmentVariableScopeEnum,
            })
          ).then(() => {
            setClosing(true)
          })
        }
      }
    }
  })

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
    return 'Lorem ipsum blablabla'
  }

  const computeAvailableScope = (): EnvironmentVariableScopeEnum[] => {
    if (!props.variable) {
      return [
        EnvironmentVariableScopeEnum.PROJECT,
        EnvironmentVariableScopeEnum.ENVIRONMENT,
        EnvironmentVariableScopeEnum.APPLICATION,
      ]
    }

    const environmentScopes: {
      name: EnvironmentVariableScopeEnum
      hierarchy: number
    }[] = [
      {
        name: EnvironmentVariableScopeEnum.BUILT_IN,
        hierarchy: -1,
      },
      {
        name: EnvironmentVariableScopeEnum.PROJECT,
        hierarchy: 1,
      },
      {
        name: EnvironmentVariableScopeEnum.ENVIRONMENT,
        hierarchy: 2,
      },
      {
        name: EnvironmentVariableScopeEnum.APPLICATION,
        hierarchy: 3,
      },
    ]

    const theScope = environmentScopes.find((s) => {
      return s.name === props?.variable?.scope
    })

    return environmentScopes
      .filter((scope) => {
        return scope.hierarchy >= (theScope?.hierarchy || -1) && scope.hierarchy >= 0
      })
      .map((scope) => scope.name)
  }

  return (
    <CrudEnvironmentVariableModal
      mode={mode}
      title={computeTitle()}
      description={computeDescription()}
      onSubmit={onSubmit}
      control={control}
      formState={formState}
      setOpen={props.setOpen}
      type={props.type}
      availableScopes={computeAvailableScope()}
    />
  )
}

export default CrudEnvironmentVariableModalFeature
