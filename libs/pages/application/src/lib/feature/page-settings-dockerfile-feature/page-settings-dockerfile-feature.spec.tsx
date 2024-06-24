import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { lifecycleJobFactoryMock } from '@qovery/shared/factories'
import { Section } from '@qovery/shared/ui'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { PageSettingsDockerfileFeature } from './page-settings-dockerfile-feature'

const mockLifecycleJob = lifecycleJobFactoryMock(1)[0]
const mockEditService = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useService: () => ({
    data: mockLifecycleJob,
  }),
  useEditService: () => ({
    mutate: mockEditService,
    isLoading: false,
  }),
}))

describe('PageSettingsDockerfileFeature', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(
        <Section>
          <PageSettingsDockerfileFeature />
        </Section>
      )
    )
    expect(baseElement).toMatchSnapshot()
  })
})
