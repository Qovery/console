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
