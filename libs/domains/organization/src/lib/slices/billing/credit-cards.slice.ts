import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { BillingApi, CreditCard, CreditCardRequest } from 'qovery-typescript-axios'
import { CreditCardsState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const CREDIT_CARDS_FEATURE_KEY = 'creditCards'

export const creditCardsAdapter = createEntityAdapter<CreditCard>()
const billingApi = new BillingApi()

export const fetchCreditCards = createAsyncThunk<CreditCard[], { organizationId: string }>(
  'creditCards/fetch',
  async (data, thunkApi) => {
    const response = await billingApi.listOrganizationCreditCards(data.organizationId)

    return response.data.results as CreditCard[]
  }
)

export const addCreditCard = createAsyncThunk<
  CreditCard,
  { organizationId: string; creditCardRequest: CreditCardRequest }
>('creditCards/add', async (data, thunkApi) => {
  // if expiryYear does not have 4 digits, we add 2000 to it
  if (data.creditCardRequest.expiry_year < 1000) {
    data.creditCardRequest.expiry_year += 2000
  }

  const response = await billingApi.addCreditCard(data.organizationId, data.creditCardRequest)

  return response.data as CreditCard
})

export const deleteCreditCard = createAsyncThunk<void, { organizationId: string; creditCardId: string }>(
  'creditCards/delete',
  async (data, thunkApi) => {
    const response = await billingApi.deleteCreditCard(data.organizationId, data.creditCardId)

    return response.data
  }
)

export const initialCreditCardsState: CreditCardsState = creditCardsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinCreditCardsOrganization: {},
})

export const creditCardsSlice = createSlice({
  name: CREDIT_CARDS_FEATURE_KEY,
  initialState: initialCreditCardsState,
  reducers: {
    add: creditCardsAdapter.addOne,
    remove: creditCardsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      // get environments
      .addCase(fetchCreditCards.pending, (state: CreditCardsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchCreditCards.fulfilled, (state: CreditCardsState, action) => {
        creditCardsAdapter.upsertMany(state, action.payload)
        action.payload.forEach((creditCard) => {
          state.joinCreditCardsOrganization = addOneToManyRelation(action.meta.arg.organizationId, creditCard.id, {
            ...state.joinCreditCardsOrganization,
          })
        })

        state.loadingStatus = 'loaded'
      })
      .addCase(fetchCreditCards.rejected, (state: CreditCardsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(addCreditCard.fulfilled, (state: CreditCardsState, action) => {
        creditCardsAdapter.addOne(state, action.payload)
        state.joinCreditCardsOrganization = addOneToManyRelation(action.meta.arg.organizationId, action.payload.id, {
          ...state.joinCreditCardsOrganization,
        })

        toast(ToastEnum.SUCCESS, 'Credit card successfully added')
      })
      .addCase(addCreditCard.rejected, (state: CreditCardsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message

        toastError(action.error, 'Error while adding credit card')
      })
      .addCase(deleteCreditCard.fulfilled, (state: CreditCardsState, action) => {
        creditCardsAdapter.removeOne(state, action.meta.arg.creditCardId)
        state.joinCreditCardsOrganization = removeOneToManyRelation(
          action.meta.arg.creditCardId,
          state.joinCreditCardsOrganization
        )

        toast(ToastEnum.SUCCESS, 'Credit card successfully removed')
      })
      .addCase(deleteCreditCard.rejected, (state: CreditCardsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message

        toastError(action.error, 'Error while removing credit card')
      })
  },
})

export const creditCardsReducer = creditCardsSlice.reducer

export const environmentsActions = creditCardsSlice.actions

const { selectAll, selectEntities } = creditCardsAdapter.getSelectors()

export const getCreditCardsState = (rootState: RootState): CreditCardsState =>
  rootState.organization[CREDIT_CARDS_FEATURE_KEY]

export const selectAllCreditCards = createSelector(getCreditCardsState, selectAll)

export const selectCreditCardsEntities = createSelector(getCreditCardsState, selectEntities)

export const selectCreditCardsByOrganizationId = (state: RootState, organizationId?: string): CreditCard[] => {
  const creditCardsState = getCreditCardsState(state)

  if (!organizationId) return []

  return getEntitiesByIds<CreditCard>(
    creditCardsState.entities,
    creditCardsState?.joinCreditCardsOrganization[organizationId]
  )
}

export const selectCreditCardById = (state: RootState, id: string) => getCreditCardsState(state).entities[id]

export const environmentsLoadingStatus = (state: RootState): string | undefined =>
  getCreditCardsState(state).loadingStatus
