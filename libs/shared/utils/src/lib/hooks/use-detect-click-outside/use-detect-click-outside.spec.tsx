import { act, render, screen } from '__tests__/utils/setup-jest'
import { createElement } from 'react'
import DetectClickOutside, { UseDetectOutsideProps } from './use-detect-click-outside'

describe('UseDetectOutside', () => {
  let props: UseDetectOutsideProps

  beforeEach(() => {
    props = {
      callback: jest.fn(),
      children: createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<DetectClickOutside {...props} />)

    expect(baseElement).toBeTruthy()
  })

  it('should call the callback method when clicked outside of the component', () => {
    const callback = jest.fn()

    props.callback = callback

    const table = document.createElement('button')

    render(<DetectClickOutside {...props} />, {
      container: document.body.appendChild(table),
    })

    const outsideComponent = screen.getByRole('button')

    act(() => {
      outsideComponent.click()
    })

    expect(callback).toHaveBeenCalled()
  })
})
