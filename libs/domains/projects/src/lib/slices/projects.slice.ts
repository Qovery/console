import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { Project, ProjectRequest, ProjectsApi } from 'qovery-typescript-axios'
import { ProjectsState } from '@qovery/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const PROJECTS_FEATURE_KEY = 'projects'

const projectsApi = new ProjectsApi()

export const projectsAdapter = createEntityAdapter<Project>()

export const fetchProjects = createAsyncThunk<Project[], { organizationId: string }>('projects/fetch', async (data) => {
  const response = await projectsApi.listProject(data.organizationId)
  return response.data.results as Project[]
})

export const postProject = createAsyncThunk<Project, { organizationId: string } & ProjectRequest>(
  'projects/post',
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
      // post
      .addCase(postProject.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postProject.fulfilled, (state: ProjectsState, action: PayloadAction<Project>) => {
        projectsAdapter.upsertOne(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(postProject.rejected, (state: ProjectsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
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
