import { ActionReducerMapBuilder, Update, createAsyncThunk } from '@reduxjs/toolkit'
import { BillingApi, BillingInfoRequest } from 'qovery-typescript-axios'
import { organizationAdapter } from '@qovery/domains/organization'
import { OrganizationEntity, OrganizationState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

const billingApi = new BillingApi()

export const fetchBillingInfo = createAsyncThunk(
  'organization/fetch-billing-info',
  async (payload: { organizationId: string }) => {
    const result = await billingApi.getOrganizationBillingInfo(payload.organizationId)
    return result.data
  }
)

export const editBillingInfo = createAsyncThunk(
  'organization/edit-billing-info',
  async (payload: { organizationId: string; billingInfoRequest: BillingInfoRequest }) => {
    const result = await billingApi.editOrganizationBillingInfo(payload.organizationId, payload.billingInfoRequest)
    return result.data
  }
)

export const fetchCurrentCost = createAsyncThunk(
  'organization/fetch-current-cost',
  async (payload: { organizationId: string }) => {
    const result = await billingApi.getOrganizationCurrentCost(payload.organizationId)
    return result.data
  }
)

export const fetchInvoices = createAsyncThunk(
  'organization/fetch-invoices',
  async (payload: { organizationId: string }) => {
    const result = await billingApi.listOrganizationInvoice(payload.organizationId)
    return result.data.results
  }
)

export const fetchInvoiceUrl = createAsyncThunk(
  'organization/fetch-invoice-url',
  async (payload: { organizationId: string; invoiceId: string }) => {
    const result = await billingApi.getOrganizationInvoicePDF(payload.organizationId, payload.invoiceId)
    return result.data
  }
)

export const addCreditCode = createAsyncThunk(
  'organization/add-credit-code',
  async (payload: { organizationId: string; code: string }) => {
    const result = await billingApi.addCreditCode(payload.organizationId, { code: payload.code })
    return result.data
  }
)

export const billingInfoExtraReducers = (builder: ActionReducerMapBuilder<OrganizationState>) => {
  //builder
  builder
    .addCase(fetchBillingInfo.pending, (state: OrganizationState, action) => {
      const value = state.entities[action.meta.arg.organizationId]?.billingInfos?.value

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          billingInfos: {
            loadingStatus: 'loading',
            value,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchBillingInfo.fulfilled, (state: OrganizationState, action) => {
      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          billingInfos: {
            loadingStatus: 'loaded',
            value: action.payload,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchBillingInfo.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    .addCase(addCreditCode.fulfilled, (state: OrganizationState, action) => {
      toast(ToastEnum.SUCCESS, 'Credit code added')
    })
    .addCase(addCreditCode.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    .addCase(fetchInvoices.pending, (state: OrganizationState, action) => {
      const items = state.entities[action.meta.arg.organizationId]?.invoices?.items

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          invoices: {
            loadingStatus: 'loading',
            items,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchInvoices.fulfilled, (state: OrganizationState, action) => {
      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          invoices: {
            loadingStatus: 'loaded',
            items: action.payload,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchInvoices.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    .addCase(fetchInvoiceUrl.fulfilled, (state: OrganizationState, action) => {
      toast(ToastEnum.SUCCESS, 'Invoice downloaded')
    })
    .addCase(fetchInvoiceUrl.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    .addCase(fetchCurrentCost.pending, (state: OrganizationState, action) => {
      const value = state.entities[action.meta.arg.organizationId]?.currentCost?.value

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          currentCost: {
            loadingStatus: 'loading',
            value,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchCurrentCost.fulfilled, (state: OrganizationState, action) => {
      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          currentCost: {
            loadingStatus: 'loaded',
            value: action.payload,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchCurrentCost.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    .addCase(editBillingInfo.fulfilled, (state: OrganizationState, action) => {
      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          billingInfos: {
            loadingStatus: 'loaded',
            value: action.payload,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Billing info updated!')
    })
    .addCase(editBillingInfo.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
}
