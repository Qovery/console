import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps } from './crud-modal-feature'

const props: CrudModalFeatureProps = {
  port: {
    application_port: 80,
    external_port: 444,
    is_public: true,
    protocol: PortProtocolEnum.HTTP,
    name: 'p80',
  },
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('calls the onClose function when the modal is closed', async () => {
    const onCloseMock = jest.fn()
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<CrudModalFeature onClose={onCloseMock} />))
    const closeButton = screen.getByText('Cancel')

    await userEvent.click(closeButton)

    expect(onCloseMock).toHaveBeenCalled()
  })

  it('calls the setPortData function with the correct data when submitting a new port', async () => {
    const setPortDataMock = jest.fn()
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <CrudModalFeature
          portData={{
            ports: [],
            healthchecks: undefined,
          }}
          setPortData={setPortDataMock}
          onClose={jest.fn()}
        />,
        {
          defaultValues: { internal_port: 99, external_port: 420, publicly_accessible: true },
        }
      )
    )

    const internalPortInput = screen.getByTestId('internal-port')
    await userEvent.clear(internalPortInput)
    await userEvent.type(internalPortInput, '8080')

    const submitButton = screen.getByTestId('submit-button')

    await userEvent.click(submitButton)
    expect(setPortDataMock).toHaveBeenCalledWith({
      ports: [
        {
          application_port: '8080',
          external_port: undefined,
          is_public: false,
          protocol: PortProtocolEnum.HTTP,
          name: 'p8080',
        },
      ],
      healthchecks: undefined,
    })
  })
})
