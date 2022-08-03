import { EnvironmentVariableScopeEnum, VariableImportRequestVars } from 'qovery-typescript-axios'
import { ThunkDispatch } from '@reduxjs/toolkit'
import { RootState } from '@console/store/data'
import {
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
  importEnvironmentVariables,
} from '@console/domains/environment-variable'

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
  setModalOpen: (b: boolean) => void,
  overwriteEnabled = false
): void {
  const vars = formatData(data, keys)
  dispatch(importEnvironmentVariables({ applicationId, vars, overwriteEnabled })).then(() => {
    setModalOpen(false)
    dispatch(fetchEnvironmentVariables(applicationId))
    dispatch(fetchSecretEnvironmentVariables(applicationId))
  })
}
