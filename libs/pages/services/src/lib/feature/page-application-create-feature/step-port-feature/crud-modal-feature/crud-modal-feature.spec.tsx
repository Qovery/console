import { act, fireEvent, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CrudModalFeature, { CrudModalFeatureProps } from './crud-modal-feature'

const props: CrudModalFeatureProps = {
  port: {
    application_port: 80,
    external_port: 444,
    is_public: true,
  },
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    await act(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('calls the onClose function when the modal is closed', async () => {
    const onCloseMock = jest.fn()
    const { getByText } = render(wrapWithReactHookForm(<CrudModalFeature onClose={onCloseMock} />))
    const closeButton = getByText('Cancel')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('calls the setPortData function with the correct data when submitting a new port', async () => {
    const setPortDataMock = jest.fn()
    const { getByTestId } = render(
      wrapWithReactHookForm(
        <CrudModalFeature
          portData={{
            ports: [],
            healthchecks: undefined,
          }}
          setPortData={setPortDataMock}
          onClose={() => {}}
        />,
        {
          defaultValues: { internal_port: 99, external_port: 420, publicly_accessible: true },
        }
      )
    )

    const internalPortInput = getByTestId('internal-port')
    fireEvent.change(internalPortInput, { target: { value: '8080' } })

    const submitButton = getByTestId('submit-button')

    await waitFor(() => {
      fireEvent.click(submitButton)
      expect(setPortDataMock).toHaveBeenCalledWith({
        ports: [{ application_port: '8080', external_port: undefined, is_public: false }],
        healthchecks: undefined,
      })
    })
  })
})
