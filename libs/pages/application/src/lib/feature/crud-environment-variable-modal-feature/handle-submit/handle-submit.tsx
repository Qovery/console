import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { postApplicationActionsRedeploy } from '@qovery/domains/application'
import {
  createAliasEnvironmentVariables,
  createAliasSecret,
  createEnvironmentVariables,
  createOverrideEnvironmentVariables,
  createOverrideSecret,
  createSecret,
  editEnvironmentVariables,
  editSecret,
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
} from '@qovery/domains/environment-variable'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { type SecretEnvironmentVariableEntity } from '@qovery/shared/interfaces'
import { type AppDispatch } from '@qovery/state/store'
import {
  type CrudEnvironmentVariableModalFeatureProps,
  type DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature'

export function handleSubmitForEnvSecretCreation(
  data: DataFormEnvironmentVariableInterface,
  setLoading: (b: boolean) => void,
  props: CrudEnvironmentVariableModalFeatureProps,
  dispatch: AppDispatch,
  setClosing: (b: boolean) => void,
  serviceType: ServiceTypeEnum,
  actionRedeployEnvironment: () => void,
  callback: () => void
): void {
  if (data) {
    let entityId
    setLoading(true)
    switch (data.scope) {
      case APIVariableScopeEnum.ENVIRONMENT:
        entityId = props.environmentId
        break
      case APIVariableScopeEnum.PROJECT:
        entityId = props.projectId
        break
      case APIVariableScopeEnum.APPLICATION:
      default:
        entityId = props.applicationId
        break
    }

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
            callback: () => callback(),
          })
        )
      } else {
        actionRedeployEnvironment()
      }
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
                environmentVariableId: props.variable?.id || '',
                scope: data.scope as APIVariableScopeEnum,
                serviceType: serviceType,
                toasterCallback,
              })
            )
              .then(() => {
                setClosing(true)
              })
              .finally(() => {
                setLoading(false)
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
                environmentVariableId: props.variable?.id || '',
                scope: data.scope as APIVariableScopeEnum,
                serviceType: serviceType,
                toasterCallback,
              })
            )
              .then(() => {
                setClosing(true)
              })
              .finally(() => {
                setLoading(false)
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
                  mount_path: data.mountPath,
                },
                scope: data.scope as APIVariableScopeEnum,
                serviceType: serviceType,
                toasterCallback,
              })
            )
              .then(() => {
                setClosing(true)
              })
              .finally(() => {
                setLoading(false)
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
            scope: data.scope as APIVariableScopeEnum,
            serviceType: serviceType,
            toasterCallback,
          })
        )
          .then(async () => {
            await dispatch(
              fetchEnvironmentVariables({
                applicationId: props.applicationId,
                serviceType: serviceType,
              })
            ).unwrap()
            setClosing(true)
          })
          .finally(() => {
            setLoading(false)
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
                environmentVariableId: props.variable?.id || '',
                scope: data.scope as APIVariableScopeEnum,
                serviceType: serviceType,
                toasterCallback,
              })
            )
              .then(() => {
                setClosing(true)
              })
              .finally(() => {
                setLoading(false)
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
                environmentVariableId: props.variable?.id || '',
                scope: data.scope as APIVariableScopeEnum,
                serviceType: serviceType,
                toasterCallback,
              })
            )
              .then(() => {
                setClosing(true)
              })
              .finally(() => {
                setLoading(false)
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
                  mount_path: data.mountPath,
                },
                scope: data.scope as APIVariableScopeEnum,
                serviceType: serviceType,
                toasterCallback,
              })
            )
              .then(() => {
                setClosing(true)
              })
              .finally(() => {
                setLoading(false)
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
              value: (props.variable as SecretEnvironmentVariableEntity).aliased_secret?.key || data.value || '',
            },
            scope: data.scope as APIVariableScopeEnum,
            serviceType: serviceType,
            toasterCallback,
          })
        )
          .then(async () => {
            await dispatch(
              fetchSecretEnvironmentVariables({
                applicationId: props.applicationId,
                serviceType: serviceType,
              })
            ).unwrap()
            setClosing(true)
          })
          .finally(() => {
            setLoading(false)
          })
      }
    }
  }
}
