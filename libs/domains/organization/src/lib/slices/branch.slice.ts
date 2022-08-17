import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { GitProviderEnum, GitRepositoryBranch, OrganizationAccountGitRepositoriesApi } from 'qovery-typescript-axios'
import { BranchState } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'

export const BRANCH_FEATURE_KEY = 'branch'

const repositoryApi = new OrganizationAccountGitRepositoriesApi()

export const branchAdapter = createEntityAdapter<GitRepositoryBranch>()

export const fetchBranches = createAsyncThunk(
  'branch/fetch',
  async (payload: { organizationId: string; gitProvider: GitProviderEnum }) => {
    if (payload.gitProvider === GitProviderEnum.GITHUB) {
      const response = await repositoryApi.getOrganizationGithubRepositoryBranches(payload.organizationId)
      return response.data as GitRepositoryBranch[] | any
    }
    if (payload.gitProvider === GitProviderEnum.GITLAB) {
      const response = await repositoryApi.getOrganizationGitlabRepositoryBranches(payload.organizationId)
      return response.data as GitRepositoryBranch[] | any
    }
    if (payload.gitProvider === GitProviderEnum.BITBUCKET) {
      const response = await repositoryApi.getOrganizationBitbucketRepositoryBranches(payload.organizationId)
      return response.data as GitRepositoryBranch[] | any
    }

    return Promise.all([])
  }
)

export const initialBranchState: BranchState = branchAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const branchSlice = createSlice({
  name: BRANCH_FEATURE_KEY,
  initialState: initialBranchState,
  reducers: {
    add: branchAdapter.addOne,
    remove: branchAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state: BranchState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchBranches.fulfilled, (state: BranchState, action: PayloadAction<GitRepositoryBranch[]>) => {
        branchAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchBranches.rejected, (state: BranchState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const branchReducer = branchSlice.reducer

export const branchActions = branchSlice.actions

const { selectAll, selectEntities } = branchAdapter.getSelectors()

export const getBranchState = (rootState: RootState): BranchState => rootState.entities.organization[BRANCH_FEATURE_KEY]

export const selectAllBranch = createSelector(getBranchState, selectAll)

export const selectBranchEntities = createSelector(getBranchState, selectEntities)
