import { ResizeObserver } from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import SettingResources, { SettingResourcesProps } from './setting-resources'

const props: SettingResourcesProps = {
  application: undefined,
  displayWarningCpu: false,
}

describe('SettingResources', () => {
  beforeAll(() => {
    window.ResizeObserver = ResizeObserver
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<SettingResources {...props} />, {
        defaultValues: {
          instances: [1, 18],
          cpu: [3],
          memory: 1024,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
