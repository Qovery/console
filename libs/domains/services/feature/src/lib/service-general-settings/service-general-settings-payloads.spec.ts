import { containerFactoryMock, gitContainerFactoryMock } from '@qovery/shared/factories'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { handleContainerSubmit } from './service-general-settings-payloads'

const toWire = (payload: object) => JSON.parse(JSON.stringify(payload))

describe('handleContainerSubmit', () => {
  const data: ApplicationGeneralData = {
    name: 'api',
    description: 'API service',
    serviceType: 'CONTAINER',
    auto_deploy: true,
    registry: 'registry-id',
    image_name: 'qovery/api',
    image_tag: 'v2',
    image_entry_point: '/bin/sh',
    cmd_arguments: '',
  }

  it('should send the form image fields and no source for an image container', () => {
    const container = {
      ...containerFactoryMock(1)[0],
      source: {
        image: {
          image_name: 'qovery/api',
          tag: 'v1',
          registry: { id: 'registry-id', name: 'docker hub', url: 'https://docker.io', kind: 'DOCKER_HUB' as const },
        },
      },
    }

    const payload = toWire(handleContainerSubmit(data, container, [], []))

    expect(payload).toMatchObject({
      name: 'api',
      registry_id: 'registry-id',
      image_name: 'qovery/api',
      tag: 'v2',
      auto_deploy: true,
    })
    expect(payload).not.toHaveProperty('source')
  })

  it('should send no flat image fields, no source and no auto-deploy for a Git container', () => {
    const container = gitContainerFactoryMock(1)[0]

    const payload = toWire(handleContainerSubmit(data, container, [], []))

    expect(payload).toMatchObject({ name: 'api', description: 'API service', entrypoint: '/bin/sh' })
    expect(payload).not.toHaveProperty('registry_id')
    expect(payload).not.toHaveProperty('image_name')
    expect(payload).not.toHaveProperty('tag')
    expect(payload).not.toHaveProperty('source')
    expect(payload).not.toHaveProperty('auto_deploy')
    expect(payload).not.toHaveProperty('auto_preview')
  })
})
