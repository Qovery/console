import download from 'downloadjs'
import { ClusterStateEnum } from 'qovery-typescript-axios'
import { type RefObject } from 'react'
import { clusterFactoryMock, clusterLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterHeaderLogs, { type ClusterHeaderLogsProps } from './cluster-header-logs'

jest.mock('downloadjs', () => jest.fn())

window.HTMLElement.prototype.scroll = jest.fn()

const refScrollSection: RefObject<HTMLDivElement> = {
  current: document.createElement('div'),
}

describe('ClusterHeaderLogs', () => {
  const baseData = clusterLogFactoryMock(2, false)

  const props: ClusterHeaderLogsProps = {
    cluster: clusterFactoryMock(1)[0],
    clusterStatus: {
      cluster_id: '1',
      status: ClusterStateEnum.DEPLOYED,
      last_execution_id: '1',
      is_deployed: true,
    },
    refScrollSection: refScrollSection,
    data: baseData,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterHeaderLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should trigger scroll up on click', async () => {
    const { userEvent } = renderWithProviders(<ClusterHeaderLogs {...props} />)
    const scrollUpButton = screen.getByTestId('scroll-up-button')

    await userEvent.click(scrollUpButton)
    expect(refScrollSection?.current?.scroll).toHaveBeenCalledWith(0, 0)
  })

  it('should trigger scroll down on click', async () => {
    const { userEvent } = renderWithProviders(<ClusterHeaderLogs {...props} />)
    const scrollDownButton = screen.getByTestId('scroll-down-button')

    await userEvent.click(scrollDownButton)
    expect(refScrollSection?.current?.scroll).toHaveBeenCalledWith(0, refScrollSection?.current?.scrollHeight)
  })

  it('should trigger download on click', async () => {
    const { userEvent } = renderWithProviders(<ClusterHeaderLogs {...props} />)
    const buttons = screen.getAllByRole('button')
    const downloadButton = buttons[2]

    await userEvent.click(downloadButton)
    expect(download).toHaveBeenCalledWith(
      JSON.stringify(baseData),
      expect.stringMatching(/^data-\d+\.json$/),
      'text/json;charset=utf-8'
    )
  })
})
