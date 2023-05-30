import { render } from '@testing-library/react'
import DatePicker, { DatePickerProps } from './date-picker-header'

describe('DatePicker', () => {
  let props: DatePickerProps

  beforeEach(() => {
    props = {
      description: 'Test description',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<DatePicker {...props} />)
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
    const { baseElement } = render(<DatePicker {...props} links={links} />)
    const linksElement = baseElement.getElementsByTagName('a')
    expect(linksElement[0].classList).toContain('mb-2')
    expect(linksElement[1].classList).not.toContain('mb-2')

    expect(baseElement).toBeTruthy()
  })
})
