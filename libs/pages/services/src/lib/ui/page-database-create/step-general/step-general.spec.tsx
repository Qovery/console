import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import StepGeneral, { type StepGeneralProps } from './step-general'

const mockCluster = clusterFactoryMock(1)[0]

const props: StepGeneralProps = {
  onSubmit: jest.fn(),
  databaseVersionOptions: {},
  databaseTypeOptions: [],
  cluster: mockCluster,
  publicOptionNotAvailable: true,
}

describe('PageDatabaseCreateGeneral', () => {
  const defaultValues = {
    name: 'hello-world',
    type: DatabaseTypeEnum.POSTGRESQL,
    mode: DatabaseModeEnum.CONTAINER,
    accessibility: DatabaseAccessibilityEnum.PUBLIC,
    version: '12',
    cpu: 512,
    memory: 1024,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<StepGeneral {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
