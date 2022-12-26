import { act, getAllByTestId, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PortRow, { PortRowProps } from './port-row'

const props: PortRowProps = {
  index: 0,
  onDelete: jest.fn(),
}

describe('PortRow', () => {
  let defaultValues: any

  beforeEach(() => {
    defaultValues = {
      ports: [
        {
          application_port: 3000,
          external_port: 3000,
          is_public: false,
        },
      ],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PortRow {...props} />, { defaultValues }))
    expect(baseElement).toBeTruthy()
  })

  it('should render 2 inputs and 1 toggle', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PortRow {...props} />, { defaultValues }))
    expect(getAllByTestId(baseElement, 'input-text')).toHaveLength(2)
    expect(getAllByTestId(baseElement, 'input-toggle-button')).toHaveLength(1)
  })

  it('click should trigger onDelete', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PortRow {...props} />, { defaultValues }))

    await act(() => {
      getByTestId(baseElement, 'delete-port').click()
    })
    expect(props.onDelete).toHaveBeenCalled()
  })
})
