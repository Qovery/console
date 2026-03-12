import { PortProtocolEnum } from 'qovery-typescript-axios'
import {
  buildApplicationContainerCreatePayload,
  buildAutoscalingPolicy,
  prepareVariableImportRequest,
} from './application-container-summary-utils'

describe('application-container-summary-utils', () => {
  it('should build application payload', () => {
    const result = buildApplicationContainerCreatePayload({
      generalData: {
        name: 'my-app',
        serviceType: 'APPLICATION',
        auto_deploy: true,
        provider: 'GITHUB',
        repository: 'https://github.com/Qovery/console',
        root_path: '/',
        branch: 'staging',
        dockerfile_path: 'Dockerfile',
      },
      resourcesData: {
        cpu: 500,
        memory: 512,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 1,
        autoscaling_mode: 'NONE',
      },
      portData: {
        ports: [
          {
            application_port: 3000,
            is_public: true,
            protocol: PortProtocolEnum.HTTP,
            external_port: 443,
            name: 'web',
            public_path: '/',
          },
        ],
      },
      labelsGroup: [{ id: 'label-1', name: 'frontend' } as never],
      annotationsGroup: [{ id: 'annotation-1', name: 'nginx' } as never],
    })

    expect(result).toEqual({
      serviceType: 'APPLICATION',
      payload: expect.objectContaining({
        name: 'my-app',
        build_mode: 'DOCKER',
        dockerfile_path: 'Dockerfile',
        ports: [
          expect.objectContaining({
            internal_port: 3000,
            external_port: 443,
            publicly_accessible: true,
            protocol: PortProtocolEnum.HTTP,
            public_path: '/',
          }),
        ],
      }),
    })
  })

  it('should build container payload', () => {
    const result = buildApplicationContainerCreatePayload({
      generalData: {
        name: 'my-container',
        serviceType: 'CONTAINER',
        auto_deploy: false,
        registry: 'registry-id',
        image_name: 'qovery/console',
        image_tag: 'latest',
      },
      resourcesData: {
        cpu: 500,
        memory: 512,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 1,
        autoscaling_mode: 'NONE',
      },
      portData: { ports: [] },
      labelsGroup: [],
      annotationsGroup: [],
    })

    expect(result).toEqual({
      serviceType: 'CONTAINER',
      payload: expect.objectContaining({
        name: 'my-container',
        registry_id: 'registry-id',
        image_name: 'qovery/console',
        tag: 'latest',
      }),
    })
  })

  it('should build keda autoscaling policy when scalers are valid', () => {
    expect(
      buildAutoscalingPolicy({
        cpu: 500,
        memory: 512,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 4,
        autoscaling_mode: 'KEDA',
        scalers: [
          {
            type: 'cpu',
            config: 'targetValue: "70"',
            triggerAuthentication: 'secretTargetRef: []',
          },
        ],
      })
    ).toEqual(
      expect.objectContaining({
        mode: 'KEDA',
        scalers: [
          expect.objectContaining({
            scaler_type: 'cpu',
            trigger_authentication: { config_yaml: 'secretTargetRef: []' },
          }),
        ],
      })
    )
  })

  it('should prepare variable import request only when variables exist', () => {
    expect(prepareVariableImportRequest([])).toBeNull()

    expect(
      prepareVariableImportRequest([
        {
          variable: 'MY_VAR',
          value: 'value',
          scope: 'APPLICATION',
          isSecret: false,
        },
      ])
    ).toEqual({
      overwrite: true,
      vars: [
        {
          name: 'MY_VAR',
          value: 'value',
          scope: 'APPLICATION',
          is_secret: false,
        },
      ],
    })
  })
})
