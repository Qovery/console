import { type PreloadedState, combineReducers, configureStore } from '@reduxjs/toolkit'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { initialUserSignUpState, initialUserState, userReducer, userSignUp } from '@qovery/domains/users/data-access'

export const rootReducer = combineReducers({
  user: userReducer,
  userSignUp: userSignUp,
})

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export const initialRootState = (): RootState => ({
  user: initialUserState,
  userSignUp: initialUserSignUpState,
})
