import { render } from '__tests__/utils/setup-jest'
import { fireEvent, screen } from '@testing-library/react'

import ModalConfirmation, { ModalConfirmationProps } from './modal-confirmation'

describe('ModalConfirmation', () => {
  let props: ModalConfirmationProps

  beforeEach(() => {
    props = {
      title: 'my title',
      description: 'my description',
      name: 'staging',
      callback: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ModalConfirmation {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an action to copy the name', () => {
    props.name = 'production'

    render(<ModalConfirmation {...props} />)

    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    })

    const copy = screen.queryByTestId('copy-cta') as HTMLSpanElement
    fireEvent.click(copy)

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('production')
  })
})
