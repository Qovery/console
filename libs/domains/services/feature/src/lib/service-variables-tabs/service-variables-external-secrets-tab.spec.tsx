import { type ReactNode } from 'react'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ExternalSecretsTab } from './service-variables-external-secrets-tab'

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  useModal: jest.fn(),
  useModalConfirmation: jest.fn(),
}))

describe('ExternalSecretsTab', () => {
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const useModalConfirmationMock = useModalConfirmation as jest.MockedFunction<typeof useModalConfirmation>

  beforeEach(() => {
    jest.clearAllMocks()

    useModalMock.mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
    })

    useModalConfirmationMock.mockReturnValue({
      openModalConfirmation: jest.fn(),
    })
  })

  it('should render the updated external secrets table layout', () => {
    const { container } = renderWithProviders(<ExternalSecretsTab selectedCaseId="filled" />)

    expect(screen.getByText('7 external secrets')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /check references/i }).length).toBeGreaterThan(0)
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getAllByText('Valid').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Invalid').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No sources detected').length).toBeGreaterThan(0)
    expect(container).toMatchSnapshot()
  })
})
