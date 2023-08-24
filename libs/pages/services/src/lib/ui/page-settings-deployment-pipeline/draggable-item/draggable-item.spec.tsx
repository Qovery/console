import { render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import DraggableItem, { type DraggableItemProps } from './draggable-item'

const applications = applicationFactoryMock(1)
const databases = databaseFactoryMock(1)

describe('DraggableItem', () => {
  const props: DraggableItemProps = {
    services: [...applications, ...databases],
    serviceId: applications[0].id,
    cloudProvider: CloudProviderEnum.AWS,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<DraggableItem {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a application content', () => {
    const { getByText } = render(<DraggableItem {...props} />)

    expect(getByText(applications[0].name)).toBeInTheDocument()
  })

  it('should render a database content', () => {
    props.services = databases
    props.serviceId = databases[0].id
    const { getByText, getByTestId } = render(<DraggableItem {...props} />)

    expect(getByText(databases[0].name)).toBeInTheDocument()
    expect(getByTestId('draggable-item-subtitle').textContent).toBe(
      `${upperCaseFirstLetter(databases[0].type)} - ${upperCaseFirstLetter(databases[0].mode)}`
    )
  })
})
