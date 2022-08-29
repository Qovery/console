import { ResizeObserver } from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@console/domains/application'
import { MemorySizeEnum } from '@console/shared/enums'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

const application = applicationFactoryMock(1)[0]
describe('PageSettingsResourcesFeature', () => {
  window.ResizeObserver = ResizeObserver
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit resources with converters with GB', () => {
    const size = MemorySizeEnum.GB
    const cpu = 3400
    const memory = 16
    const app = handleSubmit({ instances: [1, 10], cpu: [cpu], memory: memory }, application, size)

    expect(app.min_running_instances).toBe(1)
    expect(app.max_running_instances).toBe(10)
    expect(app.cpu).toBe(cpu * 1000)
    expect(app.memory).toBe(memory * 1024)
  })

  it('should submit resources with converters with MB', () => {
    const size = MemorySizeEnum.MB
    const cpu = 3400
    const memory = 512
    const app = handleSubmit({ instances: [1, 10], cpu: [cpu], memory: memory }, application, size)

    expect(app.min_running_instances).toBe(1)
    expect(app.max_running_instances).toBe(10)
    expect(app.cpu).toBe(cpu * 1000)
    expect(app.memory).toBe(memory)
  })
})
