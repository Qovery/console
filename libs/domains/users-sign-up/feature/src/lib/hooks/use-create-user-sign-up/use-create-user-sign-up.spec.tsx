import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { type LocalSignUpPayload, mutations } from '@qovery/domains/users-sign-up/data-access'
import { act, renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useSignUpCargo } from '../use-signup-cargo/use-signup-cargo'
import { useCreateUserSignUp } from './use-create-user-sign-up'

jest.mock('../use-signup-cargo/use-signup-cargo', () => ({ useSignUpCargo: jest.fn() }))

describe('useCreateUserSignUp', () => {
  it.each([undefined, false])('saves the profile with sendToCargo=%s', async (sendToCargo) => {
    const payload = {
      user_email: 'john@acme.com',
      first_name: 'John',
      last_name: 'Doe',
      company_name: 'Acme',
      current_step: 'project',
    } as LocalSignUpPayload
    const save = jest.spyOn(mutations, 'createUserSignup').mockResolvedValue(undefined)
    const signUpCargo = jest.fn()
    jest.mocked(useSignUpCargo).mockReturnValue({ mutate: signUpCargo } as unknown as ReturnType<typeof useSignUpCargo>)
    const queryClient = new QueryClient()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateUserSignUp(sendToCargo === undefined ? undefined : { sendToCargo }), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(save).toHaveBeenCalledWith(payload)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queries.usersSignUp.get.queryKey })
    const cargoPayload = expect.objectContaining({
      email: 'john@acme.com',
      first_name: 'John',
      signup_source: 'Console',
    })
    expect(signUpCargo.mock.calls).toEqual(sendToCargo === false ? [] : [[cargoPayload]])
    save.mockRestore()
    queryClient.clear()
  })
})
