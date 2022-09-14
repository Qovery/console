import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { postEnvironmentActionsRestart } from '@qovery/domains/environment'
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
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { SecretEnvironmentVariableEntity } from '@qovery/shared/interfaces'
import {
  CrudEnvironmentVariableModalFeatureProps,
  DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature'

export function handleSubmitForEnvSecretCreation(
  data: DataFormEnvironmentVariableInterface,
  setLoading: (b: boolean) => void,
  props: CrudEnvironmentVariableModalFeatureProps,
  dispatch: any,
  setClosing: (b: boolean) => void,
  serviceType: ServiceTypeEnum
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
      dispatch(postEnvironmentActionsRestart({ projectId: props.projectId, environmentId: props.environmentId }))
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
