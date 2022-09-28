import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  AvailableContainerRegistryResponse,
  ContainerRegistriesApi,
  ContainerRegistryRequest,
  ContainerRegistryResponse,
  OrganizationEditRequest,
  OrganizationMainCallsApi,
  OrganizationRequest,
} from 'qovery-typescript-axios'
import { OrganizationEntity, OrganizationState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/toast'
import { refactoOrganizationPayload } from '@qovery/shared/utils'
import { RootState } from '@qovery/store/data'

export const ORGANIZATION_KEY = 'organizations'

const organizationMainCalls = new OrganizationMainCallsApi()
const containerRegistriesApi = new ContainerRegistriesApi()

export const organizationAdapter = createEntityAdapter<OrganizationEntity>()

export const fetchOrganization = createAsyncThunk('organization/fetch', async () => {
  const response = await organizationMainCalls.listOrganization()

  return response.data.results as OrganizationEntity[]
})

export const postOrganization = createAsyncThunk<OrganizationEntity, OrganizationRequest>(
  'organization/post',
  async (data: OrganizationRequest, { rejectWithValue }) => {
    try {
      const result = await organizationMainCalls.createOrganization(data)
      return result.data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const editOrganization = createAsyncThunk(
  'organization/edit',
  async (payload: { organizationId: string; data: Partial<OrganizationEntity> }) => {
    const cloneOrganization = Object.assign({}, refactoOrganizationPayload(payload.data))
    const response = await organizationMainCalls.editOrganization(
      payload.organizationId,
      cloneOrganization as OrganizationEditRequest
    )

    return response.data as OrganizationEntity
  }
)

export const deleteOrganization = createAsyncThunk(
  'organization/delete',
  async (payload: { organizationId: string }) => {
    return await organizationMainCalls.deleteOrganization(payload.organizationId)
  }
)

export const fetchOrganizationContainerRegistries = createAsyncThunk<
  ContainerRegistryResponse[],
  { organizationId: string }
>('organization/containerRegistries/fetch', async (data) => {
  const result = await containerRegistriesApi.listContainerRegistry(data.organizationId)
  return result.data.results as ContainerRegistryResponse[]
})

export const postOrganizationContainerRegistry = createAsyncThunk(
  'organization/containerRegistries/post',
  async (payload: { organizationId: string; data: ContainerRegistryRequest }) => {
    // edit container registry
    const result = await containerRegistriesApi.createContainerRegistry(payload.organizationId, payload.data)
    return result.data as ContainerRegistryResponse
  }
)

export const editOrganizationContainerRegistry = createAsyncThunk(
  'organization/containerRegistries/edit',
  async (payload: { organizationId: string; containerRegistryId: string; data: ContainerRegistryRequest }) => {
    // edit container registry
    const result = await containerRegistriesApi.editContainerRegistry(
      payload.organizationId,
      payload.containerRegistryId,
      payload.data
    )
    return result.data as ContainerRegistryResponse
  }
)

export const deleteOrganizationContainerRegistry = createAsyncThunk(
  'organization/containerRegistries/delete',
  async (payload: { organizationId: string; containerRegistryId: string }) => {
    // delete container registry
    await containerRegistriesApi.deleteContainerRegistry(payload.organizationId, payload.containerRegistryId)
  }
)

export const fetchAvailableContainerRegistry = createAsyncThunk('availableContainerRegistry/fetch', async () => {
  // fetch container registries
  const result = (await containerRegistriesApi.listAvailableContainerRegistry()) as any
  return result.data.results as AvailableContainerRegistryResponse[]
})

export const initialOrganizationState: OrganizationState = organizationAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  availableContainerRegistries: {
    loadingStatus: 'not loaded',
    items: [],
  },
})

export const organizationSlice = createSlice({
  name: ORGANIZATION_KEY,
  initialState: initialOrganizationState,
  reducers: {
    addOrganization: organizationAdapter.addOne,
    removeOrganization: organizationAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<OrganizationEntity[]>) => {
        organizationAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // post organization
      .addCase(postOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<OrganizationEntity>) => {
        organizationAdapter.setOne(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(postOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // delete organization
      .addCase(deleteOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(deleteOrganization.fulfilled, (state: OrganizationState, action) => {
        organizationAdapter.removeOne(state, action.meta.arg.organizationId)
        state.loadingStatus = 'loaded'
        state.error = null
        toast(ToastEnum.SUCCESS, `Your organization has been deleted`)
      })
      .addCase(deleteOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
      // edit organization
      .addCase(editOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editOrganization.fulfilled, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            ...action.payload,
          },
        }
        organizationAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Organization updated')
      })
      .addCase(editOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // fetch registry
      .addCase(fetchOrganizationContainerRegistries.pending, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            containerRegistries: {
              loadingStatus: 'loaded',
              items: state.entities[action.meta.arg.organizationId]?.containerRegistries?.items || [],
            },
          },
        }

        organizationAdapter.updateOne(state, update)
      })
      .addCase(fetchOrganizationContainerRegistries.fulfilled, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            containerRegistries: {
              loadingStatus: 'loaded',
              items: action.payload,
            },
          },
        }

        organizationAdapter.updateOne(state, update)
      })
      // post container registry
      .addCase(postOrganizationContainerRegistry.fulfilled, (state: OrganizationState, action) => {
        const containerRegistries = state.entities[action.meta.arg.organizationId]?.containerRegistries?.items || []

        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            containerRegistries: {
              loadingStatus: 'loaded',
              items: [...containerRegistries, action.payload],
            },
          },
        }
        organizationAdapter.updateOne(state, update)
        toast(ToastEnum.SUCCESS, `Container registry added`)
      })
      .addCase(postOrganizationContainerRegistry.rejected, (state: OrganizationState, action) => {
        toastError(action.error)
      })
      // edit container registry
      .addCase(editOrganizationContainerRegistry.fulfilled, (state: OrganizationState, action) => {
        const containerRegistries = state.entities[action.meta.arg.organizationId]?.containerRegistries?.items || []
        const index = containerRegistries.findIndex((obj) => obj.id === action.payload.id)
        containerRegistries[index] = action.payload

        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            containerRegistries: {
              loadingStatus: 'loaded',
              items: containerRegistries,
            },
          },
        }
        organizationAdapter.updateOne(state, update)
        toast(ToastEnum.SUCCESS, `Container registry updated`)
      })
      .addCase(editOrganizationContainerRegistry.rejected, (state: OrganizationState, action) => {
        toastError(action.error)
      })
      // delete container registry
      .addCase(deleteOrganizationContainerRegistry.fulfilled, (state: OrganizationState, action) => {
        const containerRegistries = state.entities[action.meta.arg.organizationId]?.containerRegistries?.items || []

        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            containerRegistries: {
              loadingStatus: 'loaded',
              items: containerRegistries.filter((registry) => registry.id !== action.meta.arg.containerRegistryId),
            },
          },
        }
        organizationAdapter.updateOne(state, update)
        toast(ToastEnum.SUCCESS, `Container registry removed`)
      })
      .addCase(deleteOrganizationContainerRegistry.rejected, (state: OrganizationState, action) => {
        toastError(action.error)
      })
      // fetch container registries
      .addCase(fetchAvailableContainerRegistry.pending, (state: OrganizationState) => {
        state.availableContainerRegistries.loadingStatus = 'loading'
      })
      .addCase(
        fetchAvailableContainerRegistry.fulfilled,
        (state: OrganizationState, action: PayloadAction<AvailableContainerRegistryResponse[]>) => {
          state.availableContainerRegistries.loadingStatus = 'loaded'
          state.availableContainerRegistries.items = action.payload
        }
      )
  },
})

export const organization = organizationSlice.reducer

export const { addOrganization, removeOrganization } = organizationSlice.actions

const { selectAll } = organizationAdapter.getSelectors()

export const getOrganizationState = (rootState: RootState): OrganizationState =>
  rootState.entities.organization[ORGANIZATION_KEY]

export const selectAllOrganization = createSelector(getOrganizationState, selectAll)

export const selectOrganizationById = (state: RootState, organizationId: string) =>
  getOrganizationState(state).entities[organizationId]

export const selectOrganizationLoadingStatus = createSelector(getOrganizationState, (state) => state.loadingStatus)

export const selectAvailableContainerRegistry = createSelector(
  getOrganizationState,
  (state) => state.availableContainerRegistries.items
)

export const selectAvailableContainerRegistryLoadingStatus = createSelector(
  getOrganizationState,
  (state) => state.availableContainerRegistries.loadingStatus
)
