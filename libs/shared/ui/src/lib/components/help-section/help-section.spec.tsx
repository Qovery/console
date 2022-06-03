import { render } from '@testing-library/react'

import HelpSection, { HelpSectionProps } from './help-section'

describe('HelpSection', () => {
  let props: HelpSectionProps

  beforeEach(() => {
    props = {
      description: 'Test description',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<HelpSection {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should add spacing between links except the last one', () => {
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
    const { baseElement } = render(<HelpSection {...props} links={links} />)
    const linksElement = baseElement.getElementsByTagName('a')
    expect(linksElement[0].classList).toContain('mb-2')
    expect(linksElement[1].classList).not.toContain('mb-2')

    expect(baseElement).toBeTruthy()
  })
})
