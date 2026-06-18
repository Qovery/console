import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { GcpKmsKey } from './gcp-kms-key'

describe('GcpKmsKey', () => {
  describe('fromDetail mode', () => {
    it('renders disabled toggle when kmsKeyValue is not provided', () => {
      renderWithProviders(wrapWithReactHookForm(<GcpKmsKey fromDetail />))

      expect(screen.getByTestId('input-toggle')).toHaveClass('opacity-50')
    })

    it('renders enabled toggle when kmsKeyValue is provided', () => {
      renderWithProviders(
        wrapWithReactHookForm(
          <GcpKmsKey
            fromDetail
            kmsKeyValue="projects/my-project/locations/us-central1/keyRings/my-ring/cryptoKeys/my-key"
          />
        )
      )

      expect(screen.getByTestId('input-toggle')).not.toHaveClass('opacity-50')
    })
  })

  describe('form mode', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('does not show KMS key input when toggle is disabled', () => {
      renderWithProviders(
        wrapWithReactHookForm(<GcpKmsKey />, {
          defaultValues: { gke_kms_key: { enabled: false } },
        })
      )

      expect(screen.queryByLabelText('KMS Key')).not.toBeInTheDocument()
    })

    it('shows KMS key input when toggle is enabled', () => {
      renderWithProviders(
        wrapWithReactHookForm(<GcpKmsKey />, {
          defaultValues: { gke_kms_key: { enabled: true } },
        })
      )

      expect(screen.getByLabelText('KMS Key')).toBeInTheDocument()
    })

    it('always shows documentation link', () => {
      renderWithProviders(wrapWithReactHookForm(<GcpKmsKey />))

      expect(screen.getByText('Documentation link')).toBeInTheDocument()
    })

    it('shows required validation error when key input is blurred empty', async () => {
      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<GcpKmsKey />, {
          defaultValues: { gke_kms_key: { enabled: true } },
        })
      )

      const input = screen.getByLabelText('KMS Key')
      await userEvent.type(input, 'a')
      await userEvent.clear(input)

      await waitFor(() => expect(screen.getByText('Please enter a KMS key.')).toBeInTheDocument())
    })

    it('shows pattern validation error for invalid KMS key format', async () => {
      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<GcpKmsKey />, {
          defaultValues: { gke_kms_key: { enabled: true } },
        })
      )

      const input = screen.getByLabelText('KMS Key')
      await userEvent.type(input, 'not-a-valid-key')
      await userEvent.tab()

      await waitFor(() =>
        expect(
          screen.getByText(
            'Invalid KMS key format. Expected: projects/{project}/locations/{location}/keyRings/{keyRing}/cryptoKeys/{key}'
          )
        ).toBeInTheDocument()
      )
    })

    it('hides KMS key input after toggling off', async () => {
      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<GcpKmsKey />, {
          defaultValues: { gke_kms_key: { enabled: true } },
        })
      )

      expect(screen.getByLabelText('KMS Key')).toBeInTheDocument()

      await userEvent.click(screen.getByTestId('input-toggle-button'))

      await waitFor(() => expect(screen.queryByLabelText('KMS Key')).not.toBeInTheDocument())
    })
  })
})
