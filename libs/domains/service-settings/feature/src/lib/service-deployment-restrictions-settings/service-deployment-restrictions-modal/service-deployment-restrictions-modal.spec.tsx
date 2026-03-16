import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { useCreateDeploymentRestriction, useEditDeploymentRestriction } from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceDeploymentRestrictionsModal } from './service-deployment-restrictions-modal'

const createProps = {
  onClose: jest.fn(),
  serviceId: 'service-1',
  serviceType: 'JOB' as const,
}

const editProps = {
  deploymentRestriction: {
    id: 'restriction-1',
    created_at: '2022-07-21T09:59:41.999006Z',
    mode: DeploymentRestrictionModeEnum.EXCLUDE,
    type: DeploymentRestrictionTypeEnum.PATH,
    value: 'foobar',
  },
  onClose: jest.fn(),
  serviceId: 'service-1',
  serviceType: 'JOB' as const,
}

jest.mock('@qovery/domains/services/feature', () => {
  const createMutate = jest.fn()
  const editMutate = jest.fn()

  return {
    ...jest.requireActual('@qovery/domains/services/feature'),
    useCreateDeploymentRestriction: () => ({
      mutate: createMutate,
      isLoading: false,
    }),
    useEditDeploymentRestriction: () => ({
      mutate: editMutate,
      isLoading: false,
    }),
  }
})

describe('ServiceDeploymentRestrictionsModal', () => {
  it('creates a deployment restriction', async () => {
    const { userEvent } = renderWithProviders(<ServiceDeploymentRestrictionsModal {...createProps} />)

    const submitButton = await screen.findByRole('button', { name: /create/i })

    expect(submitButton).toBeInTheDocument()

    await selectEvent.select(screen.getByLabelText('Mode'), ['MATCH'], {
      container: document.body,
    })

    await userEvent.clear(screen.getByLabelText('Value'))
    await userEvent.type(screen.getByLabelText('Value'), 'baz')
    await userEvent.click(submitButton)

    expect(useCreateDeploymentRestriction().mutate).toHaveBeenCalledWith({
      payload: {
        mode: 'MATCH',
        type: 'PATH',
        value: 'baz',
      },
      serviceId: 'service-1',
      serviceType: 'JOB',
    })
  })

  it('edits a deployment restriction', async () => {
    const { userEvent } = renderWithProviders(<ServiceDeploymentRestrictionsModal {...editProps} />)

    const submitButton = await screen.findByRole('button', { name: /confirm/i })

    expect(submitButton).toBeInTheDocument()

    await selectEvent.select(screen.getByLabelText('Mode'), ['MATCH'], {
      container: document.body,
    })

    await userEvent.clear(screen.getByLabelText('Value'))
    await userEvent.type(screen.getByLabelText('Value'), 'baz')
    await userEvent.click(submitButton)

    expect(useEditDeploymentRestriction().mutate).toHaveBeenCalledWith({
      payload: {
        mode: 'MATCH',
        type: 'PATH',
        value: 'baz',
      },
      deploymentRestrictionId: 'restriction-1',
      serviceId: 'service-1',
      serviceType: 'JOB',
    })
  })
})
