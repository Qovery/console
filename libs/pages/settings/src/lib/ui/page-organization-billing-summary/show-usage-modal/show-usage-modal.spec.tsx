import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ShowUsageModal, { type ShowUsageModalProps } from './show-usage-modal'

const useOrganizationsSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useOrganizations')

const props: ShowUsageModalProps = {
  organizationId: '0',
  renewalAt: '2022-01-01T00:00:00Z',
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  loading: true,
}

describe('ShowUsageModal', () => {
  beforeEach(() => {
    useOrganizationsSpy.mockReturnValue({
      data: organizationFactoryMock(1)[0],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm<{ code: string }>(<ShowUsageModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should call on submit', async () => {
    const spy = jest.fn()
    props.loading = false
    props.onSubmit = spy

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<ShowUsageModal {...props} onSubmit={spy} />, {
        defaultValues: {
          expires: 24,
          report_period: 'current_month',
        },
      })
    )

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(spy).toHaveBeenCalled()
  })
})
