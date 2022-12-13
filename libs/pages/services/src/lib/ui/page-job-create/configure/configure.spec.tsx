import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { GeneralData } from '../../../feature/page-job-create-feature/job-creation-flow.interface'
import Configure, { ConfigureProps } from './configure'

const props: ConfigureProps = {
  jobType: 'cron',
  onSubmit: jest.fn(),
}

describe('Configure', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<GeneralData>(<Configure {...props} />, {
        defaultValues: {
          name: 'test',
          serviceType: ServiceTypeEnum.CONTAINER,
          description: 'Remi is a bg',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
