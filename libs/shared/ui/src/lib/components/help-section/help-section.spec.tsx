import { render } from '@testing-library/react'

import HelpSection from './help-section'

describe('HelpSection', () => {
  it('should render successfully', () => {
    const description = 'Test description'
    const { baseElement } = render(<HelpSection description="Test description" />)
    expect(baseElement).toBeTruthy()
  })

  it('should add spacing between links except the last one', () => {
    const description = 'Test description'
    const links = [
      {
        link: '#',
        linkLabel: 'How to configure my application',
        external: true,
      },
      {
        link: '#',
        linkLabel: 'How to delete my application',
        external: true,
      },
    ]
    const { baseElement } = render(<HelpSection description="Test description" links={links} />)
    const linksElement = baseElement.getElementsByTagName('a')
    expect(linksElement[0].classList).toContain('mb-2')
    expect(linksElement[1].classList).not.toContain('mb-2')

    expect(baseElement).toBeTruthy()
  })
})
