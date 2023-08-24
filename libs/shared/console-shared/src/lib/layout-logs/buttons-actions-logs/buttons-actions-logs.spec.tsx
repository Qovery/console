import { act, render } from '__tests__/utils/setup-jest'
import { type RefObject } from 'react'
import ButtonsActionsLogs, { type ButtonsActionsLogsProps } from './buttons-actions-logs'

window.HTMLElement.prototype.scroll = function () {}

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
    const { baseElement } = render(<ButtonsActionsLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should triggers downloadJSON on click', async () => {
    const { getByTestId } = render(<ButtonsActionsLogs {...props} />)

    const downloadButton = getByTestId('download')
    downloadButton.click()

    await act(async () => {
      expect(downloadButton).toBeDefined()
    })
  })

  it('should triggers forcedScroll on click', async () => {
    const { getByTestId } = render(<ButtonsActionsLogs {...props} />)

    const scrollUpButton = getByTestId('scroll-up-button')
    const scrollDownButton = getByTestId('scroll-down-button')

    scrollUpButton.click()
    await act(async () => {
      expect(refScrollSection?.current?.scrollTop).toBe(0)
    })

    scrollDownButton.click()
    await act(async () => {
      expect(refScrollSection?.current?.scrollTop).toBe(refScrollSection?.current?.scrollHeight)
    })
  })
})
