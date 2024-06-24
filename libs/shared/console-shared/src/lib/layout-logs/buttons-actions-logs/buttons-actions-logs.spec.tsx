import { type RefObject } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ButtonsActionsLogs, { type ButtonsActionsLogsProps } from './buttons-actions-logs'

window.HTMLElement.prototype.scroll = jest.fn()

const refScrollSection: RefObject<HTMLDivElement> = {
  current: document.createElement('div'),
}

describe('ButtonsActionsLogs', () => {
  const props: ButtonsActionsLogsProps = {
    refScrollSection: refScrollSection,
    data: {
      loadingStatus: 'loaded',
      items: [
        {
          id: '0',
          created_at: '',
          message: 'hello',
        },
      ],
    },
    setPauseLogs: jest.fn(),
    pauseLogs: true,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ButtonsActionsLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should triggers forcedScroll on click', async () => {
    const { userEvent } = renderWithProviders(<ButtonsActionsLogs {...props} />)

    const scrollUpButton = screen.getByTestId('scroll-up-button')
    const scrollDownButton = screen.getByTestId('scroll-down-button')

    await userEvent.click(scrollUpButton)
    expect(refScrollSection?.current?.scrollTop).toBe(0)

    await userEvent.click(scrollDownButton)
    expect(refScrollSection?.current?.scrollTop).toBe(refScrollSection?.current?.scrollHeight)
  })
})
