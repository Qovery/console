import { ThunkDispatch } from '@reduxjs/toolkit'
import { EnvironmentVariableScopeEnum, VariableImportRequestVars } from 'qovery-typescript-axios'
import {
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
  importEnvironmentVariables,
} from '@console/domains/environment-variable'
import { RootState } from '@console/store/data'

export function formatData(data: { [key: string]: string }, keys: string[]) {
  const vars: VariableImportRequestVars[] = []
  if (data) {
    keys.forEach((key) => {
      vars.push({
        name: data[key + '_key'],
        value: data[key + '_value'],
        scope: data[key + '_scope'] as EnvironmentVariableScopeEnum,
        is_secret: data[key + '_is_secret'] === 'true',
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
  overwriteEnabled = false
): void {
  const vars = formatData(data, keys)
  dispatch(importEnvironmentVariables({ applicationId, vars, overwriteEnabled })).then(() => {
    closeModal()
    dispatch(fetchEnvironmentVariables(applicationId))
    dispatch(fetchSecretEnvironmentVariables(applicationId))
  })
}
