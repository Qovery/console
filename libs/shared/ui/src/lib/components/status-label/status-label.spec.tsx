import { StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import StatusLabel, { type StatusLabelProps } from './status-label'

describe('StatusLabel', () => {
  const props: StatusLabelProps = {
    status: StateEnum.QUEUED,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StatusLabel {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
