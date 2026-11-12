import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { type LocalSignUpPayload, mutations } from '@qovery/domains/users-sign-up/data-access'
import { act, renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useCreateUserSignUp } from './use-create-user-sign-up'

describe('useCreateUserSignUp', () => {
  it('saves the profile and refreshes the sign-up query', async () => {
    const payload = {
      user_email: 'john@acme.com',
      first_name: 'John',
      last_name: 'Doe',
      company_name: 'Acme',
      current_step: 'project',
    } as LocalSignUpPayload
    const save = jest.spyOn(mutations, 'createUserSignup').mockResolvedValue(undefined)
    const queryClient = new QueryClient()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateUserSignUp(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(save).toHaveBeenCalledWith(payload)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queries.usersSignUp.get.queryKey })
    save.mockRestore()
    queryClient.clear()
  })
})
