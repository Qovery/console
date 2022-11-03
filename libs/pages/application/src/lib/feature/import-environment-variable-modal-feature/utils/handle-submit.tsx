import { ThunkDispatch } from '@reduxjs/toolkit'
import { APIVariableScopeEnum, VariableImportRequestVars } from 'qovery-typescript-axios'
import {
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
  importEnvironmentVariables,
} from '@qovery/domains/environment-variable'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { RootState } from '@qovery/store'

export function formatData(data: { [key: string]: string }, keys: string[]) {
  const vars: VariableImportRequestVars[] = []
  if (data) {
    keys.forEach((key) => {
      vars.push({
        name: data[key + '_key'],
        value: data[key + '_value'],
        scope: data[key + '_scope'] as APIVariableScopeEnum,
        is_secret: data[key + '_secret'] ? JSON.parse(data[key + '_secret']) : false,
      })
    })
  }
  return vars
}

export function handleSubmit(
  data: { [key: string]: string },
  applicationId: string,
  keys: string[],
  dispatch: ThunkDispatch<RootState, any, any>,
  closeModal: () => void,
  overwriteEnabled = false,
  serviceType?: ServiceTypeEnum
): void {
  if (!serviceType) return
  const vars = formatData(data, keys)
  dispatch(importEnvironmentVariables({ applicationId, vars, overwriteEnabled, serviceType })).then(() => {
    closeModal()
    dispatch(fetchEnvironmentVariables({ applicationId, serviceType }))
    dispatch(fetchSecretEnvironmentVariables({ applicationId, serviceType }))
  })
}
