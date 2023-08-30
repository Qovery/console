import { createAsyncThunk } from '@reduxjs/toolkit'
import { ApplicationActionsApi, ContainerActionsApi, JobActionsApi, type JobForceEvent } from 'qovery-typescript-axios'
import { type ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { fetchApplicationDeployments } from './applications.slice'

const applicationActionApi = new ApplicationActionsApi()
const containerActionApi = new ContainerActionsApi()
const jobActionApi = new JobActionsApi()

export const postApplicationActionsRedeploy = createAsyncThunk(
  'applicationActions/redeploy',
  async (
    data: { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean },
    { dispatch }
  ) => {
    try {
      let response
      if (isContainer(data.serviceType)) {
        response = await containerActionApi.redeployContainer(data.applicationId)
      } else if (isJob(data.serviceType)) {
        response = await jobActionApi.redeployJob(data.applicationId)
      } else {
        response = await applicationActionApi.redeployApplication(data.applicationId)
      }

      if (response.status === 202) {
        // refetch deployments after update
        if (data.withDeployments)
          await dispatch(
            fetchApplicationDeployments({
              applicationId: data.applicationId,
              serviceType: data.serviceType,
              silently: true,
            })
          )
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is redeploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Redeploying error', (err as Error).message)
    }
  }
)

export const postApplicationActionsReboot = createAsyncThunk(
  'applicationActions/reboot',
  async (
    data: { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean },
    { dispatch }
  ) => {
    try {
      let response
      if (isContainer(data.serviceType)) {
        response = await containerActionApi.rebootContainer(data.applicationId)
      } else {
        response = await applicationActionApi.rebootApplication(data.applicationId)
      }

      if (response.status === 202) {
        // refetch deployments after update
        if (data.withDeployments)
          await dispatch(
            fetchApplicationDeployments({
              applicationId: data.applicationId,
              serviceType: data.serviceType,
              silently: true,
            })
          )
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is restarting')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Restarting error', (err as Error).message)
    }
  }
)

export const postApplicationActionsDeploy = createAsyncThunk(
  'applicationActions/deploy',
  async (
    data: { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean },
    { dispatch }
  ) => {
    try {
      let response
      if (isContainer(data.serviceType)) {
        response = await containerActionApi.redeployContainer(data.applicationId)
      } else if (isJob(data.serviceType)) {
        response = await jobActionApi.redeployJob(data.applicationId)
      } else {
        response = await applicationActionApi.redeployApplication(data.applicationId)
      }

      if (response.status === 202) {
        // refetch deployments after update
        if (data.withDeployments)
          await dispatch(
            fetchApplicationDeployments({
              applicationId: data.applicationId,
              serviceType: data.serviceType,
              silently: true,
            })
          )
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is deploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
    }
  }
)

export const postApplicationActionsDeployByCommitId = createAsyncThunk(
  'applicationActions/deploy',
  async (
    data: { environmentId: string; applicationId: string; git_commit_id: string; serviceType: ServiceTypeEnum },
    { dispatch }
  ) => {
    try {
      let response

      if (isApplication(data.serviceType)) {
        response = await applicationActionApi.deployApplication(data.applicationId, {
          git_commit_id: data.git_commit_id,
        })
      } else {
        response = await jobActionApi.deployJob(data.applicationId, undefined, {
          git_commit_id: data.git_commit_id,
        })
      }

      if (response.status === 202) {
        toast(ToastEnum.SUCCESS, 'Your application is deploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
    }
  }
)

export const postApplicationActionsDeployByTag = createAsyncThunk(
  'applicationActions/deploy',
  async (
    data: { environmentId: string; applicationId: string; tag: string; serviceType: ServiceTypeEnum },
    { dispatch }
  ) => {
    try {
      let response

      if (isContainer(data.serviceType)) {
        response = await containerActionApi.deployContainer(data.applicationId, {
          image_tag: data.tag,
        })
      } else {
        response = await jobActionApi.deployJob(data.applicationId, undefined, {
          image_tag: data.tag,
        })
      }

      if (response.status === 202) {
        toast(ToastEnum.SUCCESS, `Your ${isJob(data.serviceType) ? 'job' : 'application'} is deploying`)
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
    }
  }
)

export const postApplicationActionsStop = createAsyncThunk(
  'applicationActions/stop',
  async (
    data: { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean },
    { dispatch }
  ) => {
    try {
      let response
      if (isContainer(data.serviceType)) {
        response = await containerActionApi.stopContainer(data.applicationId)
      } else if (isJob(data.serviceType)) {
        response = await jobActionApi.stopJob(data.applicationId)
      } else {
        response = await applicationActionApi.stopApplication(data.applicationId)
      }

      if (response.status === 202) {
        // refetch deployments after update
        if (data.withDeployments)
          await dispatch(
            fetchApplicationDeployments({
              applicationId: data.applicationId,
              serviceType: data.serviceType,
              silently: true,
            })
          )
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is stopping')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Stopping error', (err as Error).message)
    }
  }
)

export const forceRunJob = createAsyncThunk(
  'applicationActions/delete',
  async (data: { applicationId: string; jobForceEvent: JobForceEvent }, { dispatch }) => {
    try {
      const response = await jobActionApi.deployJob(data.applicationId, data.jobForceEvent)

      if (response.status === 202) {
        // success message
        toast(ToastEnum.SUCCESS, 'Your job is being run')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Job run error', (err as Error).message)
    }
  }
)
