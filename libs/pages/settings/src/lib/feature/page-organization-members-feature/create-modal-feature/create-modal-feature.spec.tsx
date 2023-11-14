import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateModalFeature, { type CreateModalFeatureProps } from './create-modal-feature'

import SpyInstance = jest.SpyInstance

const useCreateInviteMemberSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCreateInviteMember')

const props: CreateModalFeatureProps = {
  onClose: jest.fn(),
  availableRoles: [
    {
      id: '1111-1111-1111-1111',
      name: 'ADMIN',
    },
    {
      id: '2222-2222-2222-2222',
      name: 'VIEWER',
    },
  ],
  organizationId: '1',
}

describe('CreateModalFeature', () => {
  beforeEach(() => {
    useCreateInviteMemberSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CreateModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch postInviteMember if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<CreateModalFeature {...props} />)

    const inputEmail = screen.getByTestId('input-email')
    await userEvent.type(inputEmail, 'test@qovery.com')

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useCreateInviteMemberSpy().mutateAsync).toHaveBeenCalledWith({
      inviteMemberRequest: {
        email: 'test@qovery.com',
        role_id: '1111-1111-1111-1111',
      },
      organizationId: '1',
    })
  })
})
