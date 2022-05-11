import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { Project, ProjectRequest, ProjectsApi } from 'qovery-typescript-axios'
import { ProjectsState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'

export const PROJECTS_FEATURE_KEY = 'projects'

const projectsApi = new ProjectsApi()
export interface ProjectsState extends EntityState<Project> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinOrganizationProject: Record<string, string[]>
}

export const projectsAdapter = createEntityAdapter<Project>()

export const fetchProjects = createAsyncThunk<any, { organizationId: string }>('projects/fetch', async (data) => {
  const response = await projectsApi.listProject(data.organizationId).then((response) => response.data)
  return response.results as Project[]
})

export const postProjects = createAsyncThunk<any, { organizationId: string } & ProjectRequest>(
  'projects/post',
  async (data, { rejectWithValue }) => {
    const { organizationId, ...fields } = data
    try {
      const result = await projectsApi.createProject(organizationId, fields).then((response) => response.data)
      return result
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
      .addCase(postProjects.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postProjects.fulfilled, (state: ProjectsState, action: PayloadAction<Project[]>) => {
        projectsAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(postProjects.rejected, (state: ProjectsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const projects = projectsSlice.reducer

export const projectsActions = projectsSlice.actions

const { selectAll, selectEntities } = projectsAdapter.getSelectors()

export const getProjectsState = (rootState: any): ProjectsState => rootState[PROJECTS_FEATURE_KEY]

export const selectAllProjects = createSelector(getProjectsState, selectAll)

export const selectProjectsEntities = createSelector(getProjectsState, selectEntities)

export const selectProjectsEntitiesByOrgId = (state: any, organizationId: string): Project[] => {
  state = getProjectsState(state)
  return getEntitiesByIds<Project>(state.entities, state?.joinOrganizationProject[organizationId])
}
