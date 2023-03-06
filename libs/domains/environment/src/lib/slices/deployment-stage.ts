import { SerializedError } from '@reduxjs/toolkit'
import { DeploymentStageMainCallsApi, DeploymentStageRequest, DeploymentStageResponse } from 'qovery-typescript-axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

const deploymentStageMainCallApi = new DeploymentStageMainCallsApi()

export const useFetchDeploymentStageList = (environmentId: string) => {
  const queryClient = useQueryClient()

  return useQuery<DeploymentStageResponse[], Error, undefined>(
    ['environment', environmentId, 'deploymentStageList'],
    async () => {
      const response = await deploymentStageMainCallApi.listEnvironmentDeploymentStage(environmentId)
      return response.data.results as DeploymentStageResponse[]
    },
    {
      initialData: queryClient.getQueryData(['environment', environmentId, 'deploymentStageList']),
      onError: (err) => toastError(err as SerializedError),
    }
  )
}

export const useAddServiceToDeploymentStage = (environmentId: string) => {
  const queryClient = useQueryClient()

  const currentUseMutation = useMutation(
    async ({
      deploymentStageId,
      serviceId,
    }: {
      deploymentStageId: string
      serviceId: string
      prevStage?: { deploymentStageId: string; serviceId: string }
    }) => {
      const response = await deploymentStageMainCallApi.attachServiceToDeploymentStage(deploymentStageId, serviceId)
      return response.data.results
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList'])
        if (variables.prevStage) {
          // default toast when we don't apply undo
          toast(
            ToastEnum.SUCCESS,
            'Your deployment stage is updated',
            'Do you need to go back?',
            () =>
              currentUseMutation.mutate({
                deploymentStageId: variables.prevStage?.deploymentStageId || ' ',
                serviceId: variables.prevStage?.serviceId || '',
              }),
            '',
            'Undo'
          )
        } else {
          // default toast when we apply undo
          toast(ToastEnum.SUCCESS, 'Your deployment stage is updated')
        }
      },
      onError: (err) => toastError(err as SerializedError),
    }
  )

  return currentUseMutation
}

export const useMoveDeploymentStageRequested = (onSuccessCallback: (result: DeploymentStageResponse[]) => void) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({
      stageId,
      beforeOrAfterStageId,
      after,
    }: {
      stageId: string
      beforeOrAfterStageId: string
      after: boolean
    }) => {
      let response
      if (after) {
        response = await deploymentStageMainCallApi.moveAfterDeploymentStage(stageId, beforeOrAfterStageId)
      } else {
        response = await deploymentStageMainCallApi.moveBeforeDeploymentStage(stageId, beforeOrAfterStageId)
      }
      return response.data.results
    },
    {
      onSuccess: (data) => {
        if (data) {
          queryClient.setQueryData<DeploymentStageResponse[] | undefined>(
            ['environment', data[0].environment.id, 'deploymentStageList'],
            data
          )
          toast(ToastEnum.SUCCESS, 'Your stage order has been successfully updated')
          onSuccessCallback(data)
        }
      },
      onError: (err: SerializedError) => toastError(err),
    }
  )
}

export const useCreateEnvironmentDeploymentStage = (
  environmentId: string,
  onSuccessCallback: () => void,
  onSettledCallback: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ data }: { data: DeploymentStageRequest }) => {
      const response = await deploymentStageMainCallApi.createEnvironmentDeploymentStage(environmentId, data)
      return response.data
    },
    {
      onMutate: async (variables) => {
        // Cancel current queries for the deploymentStageList
        await queryClient.cancelQueries({ queryKey: ['environment', environmentId, 'deploymentStageList'] })

        // Create optimistic deployment stage
        const optimisticDeploymentStage = { id: 'optimistic-id', ...variables.data }

        // Add optimistic deployment stage to deployment stage list
        queryClient.setQueryData<DeploymentStageRequest[] | undefined>(
          ['environment', environmentId, 'deploymentStageList'],
          (old: DeploymentStageRequest[] | undefined) => [...(old || []), optimisticDeploymentStage]
        )

        // Return context with the optimistic todo
        return { optimisticDeploymentStage }
      },
      onSuccess: (result, _, context) => {
        // Replace optimistic deployment stage in the deployment stage list with the result
        queryClient.setQueryData<DeploymentStageResponse[] | undefined>(
          ['environment', environmentId, 'deploymentStageList'],
          (old) => old?.map((todo) => (todo.id === context?.optimisticDeploymentStage.id ? result : todo))
        )

        toast(ToastEnum.SUCCESS, 'Your stage has been successfully created')
        onSuccessCallback()
      },
      onError: (err, _, context) => {
        // Remove optimistic deployment stage from the deployment stage list
        queryClient.setQueryData<DeploymentStageResponse[] | undefined>(
          ['environment', environmentId, 'deploymentStageList'],
          (old) => old?.filter((todo) => todo.id !== context?.optimisticDeploymentStage.id)
        )
        toastError(err as SerializedError)
      },
      onSettled: () => onSettledCallback(),
    }
  )
}

export const useEditEnvironmentDeploymentStage = (
  environmentId: string,
  onSuccessCallback: () => void,
  onSettledCallback: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ stageId, data }: { stageId: string; data: DeploymentStageRequest }) => {
      const response = await deploymentStageMainCallApi.editDeploymentStage(stageId, data)
      return response.data
    },
    {
      onSuccess: (result, variables) => {
        queryClient.setQueryData<DeploymentStageResponse[] | undefined>(
          ['environment', environmentId, 'deploymentStageList'],
          (old) => old?.map((todo) => (todo.id === variables.stageId ? result : todo))
        )
        toast(ToastEnum.SUCCESS, 'Your stage has been successfully updated')
        onSuccessCallback()
      },
      onError: (err, variables) => {
        // Remove deployment stage from the deployment stage list
        queryClient.setQueryData<DeploymentStageResponse[] | undefined>(
          ['environment', environmentId, 'deploymentStageList'],
          (old) => old?.filter((todo) => todo.id !== variables.stageId)
        )
        toastError(err as SerializedError)
      },
      onSettled: () => onSettledCallback(),
    }
  )
}

export const useDeleteEnvironmentDeploymentStage = (environmentId: string) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ stageId }: { stageId: string }) => {
      const response = await deploymentStageMainCallApi.deleteDeploymentStage(stageId)
      return response.data
    },
    {
      onSuccess: (_, variables) => {
        // Remove deployment stage from the deployment stage list
        queryClient.setQueryData<DeploymentStageResponse[] | undefined>(
          ['environment', environmentId, 'deploymentStageList'],
          (old) => old?.filter((todo) => todo.id !== variables.stageId)
        )
        queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList'])
        toast(ToastEnum.SUCCESS, 'Your stage has been successfully deleted')
      },
      onError: (err) => toastError(err as SerializedError),
    }
  )
}
