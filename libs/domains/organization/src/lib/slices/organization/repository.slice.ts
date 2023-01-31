import { Update, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { GitProviderEnum, GitRepositoryBranch, OrganizationAccountGitRepositoriesApi } from 'qovery-typescript-axios'
import { LoadingStatus, RepositoryEntity, RepositoryState } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'

export const REPOSITORY_FEATURE_KEY = 'repository'

const repositoryApi = new OrganizationAccountGitRepositoriesApi()

export const repositoryAdapter = createEntityAdapter<RepositoryEntity>()

export const fetchRepository = createAsyncThunk(
  'repository/fetch',
  async (payload: { organizationId: string; gitProvider: GitProviderEnum }) => {
    if (payload.gitProvider === GitProviderEnum.GITHUB) {
      const response = await repositoryApi.getOrganizationGithubRepositories(payload.organizationId)
      return response.data as RepositoryEntity[]
    }
    if (payload.gitProvider === GitProviderEnum.GITLAB) {
      const response = await repositoryApi.getOrganizationGitlabRepositories(payload.organizationId)
      return response.data as RepositoryEntity[]
    }
    if (payload.gitProvider === GitProviderEnum.BITBUCKET) {
      const response = await repositoryApi.getOrganizationBitbucketRepositories(payload.organizationId)
      return response.data as RepositoryEntity[]
    }

    return Promise.all([])
  }
)

export const fetchBranches = createAsyncThunk(
  'branch/fetch',
  async (payload: { organizationId: string; gitProvider: GitProviderEnum; name: string; id?: string }) => {
    if (payload.gitProvider === GitProviderEnum.GITHUB) {
      const response = await repositoryApi.getOrganizationGithubRepositoryBranches(payload.organizationId, payload.name)
      return response.data.results as GitRepositoryBranch[]
    }
    if (payload.gitProvider === GitProviderEnum.GITLAB) {
      const response = await repositoryApi.getOrganizationGitlabRepositoryBranches(payload.organizationId, payload.name)
      return response.data.results as GitRepositoryBranch[]
    }
    if (payload.gitProvider === GitProviderEnum.BITBUCKET) {
      const response = await repositoryApi.getOrganizationBitbucketRepositoryBranches(
        payload.organizationId,
        payload.name
      )
      return response.data.results as GitRepositoryBranch[]
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
      // fetch repositories
      .addCase(fetchRepository.pending, (state: RepositoryState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchRepository.fulfilled, (state: RepositoryState, action) => {
        const extendedRepositories = action.payload.map((repository) => ({
          ...repository,
          provider: action.meta.arg.gitProvider,
        }))
        repositoryAdapter.upsertMany(state, extendedRepositories)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchRepository.rejected, (state: RepositoryState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        // reset repository
        repositoryAdapter.setAll(state, [])
        toastError(action.error)
      })
      // fetch branches by repository
      .addCase(fetchBranches.pending, (state: RepositoryState, action) => {
        const id = action.meta.arg.id
        if (id) {
          const update: Update<RepositoryEntity> = {
            id: id,
            changes: {
              branches: {
                loadingStatus: 'loading',
              },
            },
          }
          repositoryAdapter.updateOne(state, update)
        }
      })
      .addCase(fetchBranches.fulfilled, (state: RepositoryState, action) => {
        const id = action.meta.arg.id
        if (id) {
          const update: Update<RepositoryEntity> = {
            id: id,
            changes: {
              branches: {
                loadingStatus: 'loaded',
                items: action.payload,
              },
            },
          }
          repositoryAdapter.updateOne(state, update)
          state.error = null
        }
      })
      .addCase(fetchBranches.rejected, (state: RepositoryState, action) => {
        const id = action.meta.arg.id
        if (id) {
          const update: Update<RepositoryEntity> = {
            id: id,
            changes: {
              branches: {
                loadingStatus: 'error',
              },
            },
          }
          repositoryAdapter.updateOne(state, update)
        }
        state.error = action.error.message
        toastError(action.error)
      })
  },
})

export const repositoryReducer = repositorySlice.reducer

export const repositoryActions = repositorySlice.actions

const { selectAll, selectEntities } = repositoryAdapter.getSelectors()

export const getRepositoryState = (rootState: RootState): RepositoryState =>
  rootState.organization[REPOSITORY_FEATURE_KEY]

export const selectAllRepository = createSelector(getRepositoryState, selectAll)

export const selectRepositoriesByProvider = createSelector(
  [getRepositoryState, (state, gitProvider: GitProviderEnum) => gitProvider],
  (state, gitProvider) => {
    const repositories = selectAll(state)
    return repositories.filter((repo) => {
      return repo.provider === gitProvider
    })
  }
)

export const repositoryLoadingStatus = (state: RootState): LoadingStatus => getRepositoryState(state).loadingStatus

export const selectRepositoryEntities = createSelector(getRepositoryState, selectEntities)
