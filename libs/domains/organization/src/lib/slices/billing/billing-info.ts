import { type ActionReducerMapBuilder, type Update, createAsyncThunk } from '@reduxjs/toolkit'
import { BillingApi, type BillingInfoRequest } from 'qovery-typescript-axios'
import { type OrganizationEntity, type OrganizationState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { organizationAdapter } from '../organization/organization.slice'

const billingApi = new BillingApi()

export const editBillingInfo = createAsyncThunk(
  'organization/edit-billing-info',
  async (payload: { organizationId: string; billingInfoRequest: BillingInfoRequest }) => {
    const result = await billingApi.editOrganizationBillingInfo(payload.organizationId, payload.billingInfoRequest)
    return result.data
  }
)

export const addCreditCode = (payload: { organizationId: string; code: string }) => {
  return billingApi.addCreditCode(payload.organizationId, { code: payload.code })
}

export const billingInfoExtraReducers = (builder: ActionReducerMapBuilder<OrganizationState>) => {
  builder
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
