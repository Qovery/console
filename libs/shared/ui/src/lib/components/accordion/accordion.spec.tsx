import { render } from '__tests__/utils/setup-jest'
import { screen, fireEvent } from '@testing-library/react'
import Accordion, { AccordionProps } from './accordion'

let props: AccordionProps

beforeEach(() => {
  props = {
    header: <p>Trigger</p>,
    children: <p>Content</p>,
  }
})

describe('Accordion', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Accordion {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should be open on click', () => {
    render(<Accordion {...props} />)
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    const content = screen.getByRole('region')
    expect(content).toBeTruthy()
  })

  it('should be default open', () => {
    props.open = true
    render(<Accordion {...props} />)
    const content = screen.getByRole('region')
    expect(content).toBeTruthy()
  })
})
