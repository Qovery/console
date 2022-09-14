import { render, screen } from '__tests__/utils/setup-jest'
import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { clusterLogFactoryMock } from '@qovery/domains/organization'
import { LayoutLogsProps } from '@qovery/shared/ui'
import { LayoutLogsMemo } from './layout-logs'

describe('LayoutLogs', () => {
  const props: LayoutLogsProps = {
    children: <div>children</div>,
    data: {
      loadingStatus: 'loaded',
      items: clusterLogFactoryMock(2, true),
    },
    tabInformation: <div>information</div>,
  }

  it('should render successfully', () => {
    window.HTMLElement.prototype.scroll = function () {}

    const { baseElement } = render(<LayoutLogsMemo {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.data = {
      loadingStatus: 'not loaded',
      items: [],
    }

    render(<LayoutLogsMemo {...props} />)

    const loadingScreen = screen.getByTestId('loading-screen')

    expect(loadingScreen.querySelector('p')?.textContent).toBe('Loading...')
  })

  it('should have screen when data is empty', () => {
    props.data = {
      loadingStatus: 'loaded',
      items: [],
    }

    render(<LayoutLogsMemo {...props} />)

    const loadingScreen = screen.getByTestId('loading-screen')

    expect(loadingScreen.querySelector('p')?.textContent).toBe('Logs not available')
  })

  it('should have text with error line', () => {
    window.HTMLElement.prototype.scroll = function () {}

    props.data = {
      loadingStatus: 'loaded',
      items: [
        {
          step: ClusterLogsStepEnum.UNKNOWN,
        },
        {
          step: ClusterLogsStepEnum.CREATE_ERROR,
          error: {
            hint_message: 'my-message',
          },
        },
      ],
    }

    render(<LayoutLogsMemo {...props} />)

    const errorLine = screen.getByTestId('error-layout-line')

    expect(errorLine?.textContent).toBe('An error occured line 2')
  })
})
