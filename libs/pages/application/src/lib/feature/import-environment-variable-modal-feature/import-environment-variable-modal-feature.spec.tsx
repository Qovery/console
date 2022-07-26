import ImportEnvironmentVariableModalFeature, {
  ImportEnvironmentVariableModalFeatureProps,
} from './import-environment-variable-modal-feature'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

describe('ImportEnvironmentVariableModalFeature', () => {
  const props: ImportEnvironmentVariableModalFeatureProps = {
    applicationId: '123',
    setOpen: jest.fn(),
  }

  it('should render successfully', async () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature {...props} />)

    const submitButton = screen.getByRole('button', { name: 'Confirm' })
    await waitFor(() => {
      expect(baseElement).toBeTruthy()
    })
  })
})
