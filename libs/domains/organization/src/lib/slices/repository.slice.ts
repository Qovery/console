import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { GitProviderEnum, GitRepository, OrganizationAccountGitRepositoriesApi } from 'qovery-typescript-axios'
import { RepositoryState } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'

export const REPOSITORY_FEATURE_KEY = 'repository'

const repositoryApi = new OrganizationAccountGitRepositoriesApi()

export const repositoryAdapter = createEntityAdapter<GitRepository>()

export const fetchRepository = createAsyncThunk(
  'repository/fetch',
  async (payload: { organizationId: string; gitProvider: GitProviderEnum }) => {
    if (payload.gitProvider === GitProviderEnum.GITHUB) {
      const response = await repositoryApi.getOrganizationGithubRepositories(payload.organizationId)
      return response.data as GitRepository[] | any
    }
    if (payload.gitProvider === GitProviderEnum.GITLAB) {
      const response = await repositoryApi.getOrganizationGitlabRepositories(payload.organizationId)
      return response.data as GitRepository[] | any
    }
    if (payload.gitProvider === GitProviderEnum.BITBUCKET) {
      const response = await repositoryApi.getOrganizationBitbucketRepositories(payload.organizationId)
      return response.data as GitRepository[] | any
    }

    return Promise.all([])
  }
)

export const initialRepositoryState: RepositoryState = repositoryAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const repositorySlice = createSlice({
  name: REPOSITORY_FEATURE_KEY,
  initialState: initialRepositoryState,
  reducers: {
    add: repositoryAdapter.addOne,
    remove: repositoryAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepository.pending, (state: RepositoryState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchRepository.fulfilled, (state: RepositoryState, action: PayloadAction<GitRepository[]>) => {
        repositoryAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchRepository.rejected, (state: RepositoryState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const repositoryReducer = repositorySlice.reducer

export const repositoryActions = repositorySlice.actions

const { selectAll, selectEntities } = repositoryAdapter.getSelectors()

export const getRepositoryState = (rootState: RootState): RepositoryState =>
  rootState.entities.organization[REPOSITORY_FEATURE_KEY]

export const selectAllRepository = createSelector(getRepositoryState, selectAll)

export const selectRepositoryEntities = createSelector(getRepositoryState, selectEntities)
