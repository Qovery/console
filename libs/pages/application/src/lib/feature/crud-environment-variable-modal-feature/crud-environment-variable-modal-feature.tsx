import { EnvironmentVariableEntity, EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'
import CrudEnvironmentVariableModal from '../../ui/crud-environment-variable-modal/crud-environment-variable-modal'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import { createEnvironmentVariables } from '@console/domains/environment-variable'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'

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

  const { handleSubmit, control, formState } = useForm<{ key: string; value: string; scope: string }>({
    defaultValues: {
      key: variable?.key,
      scope: variable?.scope,
      value: (variable as EnvironmentVariableEntity)?.value,
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
          entityId = props.environmentId
          break
        case EnvironmentVariableScopeEnum.APPLICATION:
        default:
          entityId = props.applicationId
          break
      }

      if (props.mode === EnvironmentVariableCrudMode.CREATION) {
        dispatch(
          createEnvironmentVariables({
            entityId,
            environmentVariableRequest: {
              key: data.key,
              value: data.value,
            },
            scope: data.scope as EnvironmentVariableScopeEnum,
          })
        ).then(() => {
          props.setOpen(false)
        })
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

  return (
    <CrudEnvironmentVariableModal
      mode={mode}
      title={computeTitle()}
      description={computeDescription()}
      onSubmit={onSubmit}
      control={control}
      formState={formState}
      setOpen={props.setOpen}
    />
  )
}

export default CrudEnvironmentVariableModalFeature
