import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { JobGeneralData } from '@qovery/shared/interfaces'
import General, { GeneralProps } from './general'

const props: GeneralProps = {
  jobType: ServiceTypeEnum.CRON_JOB,
  onSubmit: jest.fn(),
}

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobGeneralData>(<General {...props} />, {
        defaultValues: {
          name: 'test',
          serviceType: ServiceTypeEnum.CONTAINER,
          description: 'Application Description',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
