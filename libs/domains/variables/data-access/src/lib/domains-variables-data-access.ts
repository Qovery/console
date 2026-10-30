import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type APIVariableScopeEnum,
  type ServiceTypeForVariableEnum,
  type VariableAliasRequest,
  type VariableImportRequest,
  VariableMainCallsApi,
  type VariableOverrideRequest,
} from 'qovery-typescript-axios'
import { type VariableEditRequest, type VariableRequest, type VariableResponse } from './variable-api.types'

const variableMainCallsApi = new VariableMainCallsApi()

export type VariableScope = keyof typeof APIVariableScopeEnum

export const variables = createQueryKeys('variables', {
  list: ({ parentId, scope, isSecret }: { parentId: string; scope: VariableScope; isSecret?: boolean }) => ({
    queryKey: [parentId, scope, isSecret],
    async queryFn(): Promise<VariableResponse[] | undefined> {
      const response = await variableMainCallsApi.listVariables(parentId, scope, isSecret)
      return response.data.results
    },
  }),
})

export const mutations = {
  async createVariable({ variableRequest }: { variableRequest: VariableRequest }): Promise<VariableResponse> {
    const response = await variableMainCallsApi.createVariable(variableRequest)
    return response.data
  },
  async createVariableAlias({
    variableId,
    variableAliasRequest,
  }: {
    variableId: string
    variableAliasRequest: VariableAliasRequest
  }) {
    const response = await variableMainCallsApi.createVariableAlias(variableId, variableAliasRequest)
    return response.data
  },
  async createVariableOverride({
    variableId,
    variableOverrideRequest,
  }: {
    variableId: string
    variableOverrideRequest: VariableOverrideRequest
  }) {
    const response = await variableMainCallsApi.createVariableOverride(variableId, variableOverrideRequest)
    return response.data
  },
  async deleteVariable({ variableId }: { variableId: string }) {
    const response = await variableMainCallsApi.deleteVariable(variableId)
    return response.data
  },
  async editVariable({
    variableId,
    variableEditRequest,
  }: {
    variableId: string
    variableEditRequest: VariableEditRequest
  }): Promise<VariableResponse> {
    const response = await variableMainCallsApi.editVariable(variableId, variableEditRequest)
    return response.data
  },
  async importVariables({
    serviceId,
    serviceType,
    variableImportRequest,
  }: {
    serviceId: string
    serviceType: ServiceTypeForVariableEnum
    variableImportRequest: VariableImportRequest
  }) {
    const response = await variableMainCallsApi.importEnvironmentVariables(
      serviceId,
      serviceType,
      variableImportRequest
    )
    return response.data
  },
}
