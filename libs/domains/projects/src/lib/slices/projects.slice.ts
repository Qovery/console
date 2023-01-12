import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { Project, ProjectMainCallsApi, ProjectRequest, ProjectsApi } from 'qovery-typescript-axios'
import { ProjectsState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const PROJECTS_FEATURE_KEY = 'projects'

const projectsApi = new ProjectsApi()
const projectMainCalls = new ProjectMainCallsApi()

export const projectsAdapter = createEntityAdapter<Project>()

export const fetchProjects = createAsyncThunk<Project[], { organizationId: string }>('projects/fetch', async (data) => {
  const response = await projectsApi.listProject(data.organizationId)
  return response.data.results as Project[]
})

export const postProject = createAsyncThunk<Project, { organizationId: string } & ProjectRequest>(
  'project/post',
  async (data, { rejectWithValue }) => {
    const { organizationId, ...fields } = data

    try {
      const result = await projectsApi.createProject(organizationId, fields)
      return result.data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const editProject = createAsyncThunk(
  'project/edit',
  async (payload: { projectId: string; data: Partial<Project> }) => {
    const cloneProject = Object.assign({}, payload.data)
    const response = await projectMainCalls.editProject(payload.projectId, cloneProject as ProjectRequest)

    return response.data as Project
  }
)

export const deleteProject = createAsyncThunk('project/delete', async (payload: { projectId: string }) => {
  return await projectMainCalls.deleteProject(payload.projectId)
})

export const initialProjectsState: ProjectsState = projectsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinOrganizationProject: {},
})

export const projectsSlice = createSlice({
  name: PROJECTS_FEATURE_KEY,
  initialState: initialProjectsState,
  reducers: {
    add: projectsAdapter.addOne,
    remove: projectsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchProjects.fulfilled, (state: ProjectsState, action: PayloadAction<Project[]>) => {
        projectsAdapter.upsertMany(state, action.payload)
        action.payload.forEach((project) => {
          state.joinOrganizationProject = addOneToManyRelation(project.organization?.id, project.id, {
            ...state.joinOrganizationProject,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchProjects.rejected, (state: ProjectsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // post project
      .addCase(postProject.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postProject.fulfilled, (state: ProjectsState, action: PayloadAction<Project>) => {
        projectsAdapter.upsertOne(state, action.payload)
        state.joinOrganizationProject = addOneToManyRelation(action.payload.organization?.id, action.payload.id, {
          ...state.joinOrganizationProject,
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(postProject.rejected, (state: ProjectsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // edit project
      .addCase(editProject.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editProject.fulfilled, (state: ProjectsState, action) => {
        const update: Update<Project> = {
          id: action.meta.arg.projectId,
          changes: {
            ...action.payload,
          },
        }
        projectsAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Project updated')
      })
      .addCase(editProject.rejected, (state: ProjectsState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // delete project
      .addCase(deleteProject.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(deleteProject.fulfilled, (state: ProjectsState, action) => {
        projectsAdapter.removeOne(state, action.meta.arg.projectId)
        state.loadingStatus = 'loaded'
        state.error = null
        toast(ToastEnum.SUCCESS, `Your project has been deleted`)
      })
      .addCase(deleteProject.rejected, (state: ProjectsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
  },
})

export const projects = projectsSlice.reducer

export const projectsActions = projectsSlice.actions

const { selectAll, selectEntities } = projectsAdapter.getSelectors()

export const getProjectsState = (rootState: RootState): ProjectsState => rootState.project[PROJECTS_FEATURE_KEY]

export const selectAllProjects = createSelector(getProjectsState, selectAll)

export const selectProjectsEntities = createSelector(getProjectsState, selectEntities)

export const selectProjectsEntitiesByOrgId = (state: RootState, organizationId: string): Project[] => {
  const projectState = getProjectsState(state)
  return getEntitiesByIds<Project>(projectState.entities, projectState?.joinOrganizationProject[organizationId])
}

export const selectProjectById = (state: RootState, organizationId: string, projectId: string): Project => {
  const projectState = getProjectsState(state)
  return getEntitiesByIds<Project>(projectState.entities, projectState?.joinOrganizationProject[organizationId]).find(
    (project: Project) => project.id === projectId
  ) as Project
}
