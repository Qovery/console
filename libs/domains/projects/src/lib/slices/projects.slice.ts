import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import axios from 'axios'

export const PROJECTS_FEATURE_KEY = 'projects'

export interface ProjectsInterface {
  name: string
  id?: number
  description?: string
}

export interface ProjectsState extends EntityState<ProjectsInterface> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}

export const projectsAdapter = createEntityAdapter<ProjectsInterface>()

export const fetchProjects = createAsyncThunk('projects/fetchStatus', async (_, thunkAPI) => {
  /**
   * Replace this with your custom fetch call.
   * For example, `return myApi.getProjectss()`;
   * Right now we just return an empty array.
   */
  return Promise.resolve([])
})

export const postProjects = createAsyncThunk<any, { organizationId: string } & Partial<ProjectsInterface>>(
  'projects/post',
  async (data, { rejectWithValue }) => {
    const { organizationId, ...fields } = data
    try {
      const result = await axios
        .post(`/organization/${organizationId}/project`, fields)
        .then((response) => response.data)
      return result
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const initialProjectsState: ProjectsState = projectsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
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
      .addCase(postProjects.pending, (state: ProjectsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postProjects.fulfilled, (state: ProjectsState, action: PayloadAction<ProjectsInterface[]>) => {
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
