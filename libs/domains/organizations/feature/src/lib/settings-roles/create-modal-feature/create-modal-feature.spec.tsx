import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateModalFeature, { type CreateModalFeatureProps } from './create-modal-feature'

import SpyInstance = jest.SpyInstance

const useCreateCustomRoleSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useCreateCustomRole')

const props: CreateModalFeatureProps = {
  onClose: jest.fn(),
  organizationId: '1',
}
describe('CreateModalFeature', () => {
  beforeEach(() => {
    useCreateCustomRoleSpy.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CreateModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch create custom role if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<CreateModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'my-role')

    expect(screen.getByTestId('input-description')).toBeInTheDocument()

    expect(screen.getByTestId('submit-button')).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useCreateCustomRoleSpy().mutateAsync).toHaveBeenCalledWith({
      customRoleUpdateRequest: {
        name: 'my-role',
      },
      organizationId: '1',
    })
  })
})
