import { render } from '@testing-library/react'

import AccordionOrganization from './accordion-organization'

describe('AccordionOrganization', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccordionOrganization />)
    expect(baseElement).toBeTruthy()
  })
})
