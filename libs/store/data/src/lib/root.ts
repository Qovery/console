import { initialOrganizationState, organizations } from '@console/domains/organizations'
import { initialUserState, user } from '@console/domains/user'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { UserInterface } from '../../../../domains/user/src/lib/interfaces/user.interface'
import { OrganizationsState } from '../../../../domains/organizations/src/lib/slices/organizations.slice'

export const rootReducer = combineReducers({
  user: user,
  organizations: organizations,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = {
  user: UserInterface
  organizations: OrganizationsState
}

export type AppDispatch = typeof store.dispatch

export const initialRootState = (): RootState => ({
  user: initialUserState,
  organizations: initialOrganizationState,
})
