import { render } from '@testing-library/react'
import Button from '../../buttons/button/button'

import { ModalArrow, ModalArrowProps } from './modal-arrow'

const props: ModalArrowProps = {
  children: <p>This is a modal</p>,
  trigger: <Button>Trigger</Button>
}

describe('ModalArrow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalArrow {...props} />)
    expect(baseElement).toBeTruthy()
  })


})
