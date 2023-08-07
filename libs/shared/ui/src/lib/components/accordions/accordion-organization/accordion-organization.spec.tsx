import { render } from '__tests__/utils/setup-jest'
import AccordionOrganization from './accordion-organization'

describe('AccordionOrganization', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccordionOrganization />)
    expect(baseElement).toBeTruthy()
  })
})
