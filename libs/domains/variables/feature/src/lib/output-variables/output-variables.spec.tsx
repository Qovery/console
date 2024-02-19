import { renderWithProviders } from '@qovery/shared/util-tests'
import { OutputVariables } from './output-variables'

jest.mock('../hooks/use-variables/use-variables', () => ({
  useVariables: () => ({
    data: [
      {
        id: 'c0277184-1fe0-4f17-b09a-58eee2c05701',
        created_at: '2023-10-25T09:13:34.723567Z',
        updated_at: '2023-10-25T09:13:34.723568Z',
        key: 'QOVERY_CONTAINER_Z04308DE2_HOST_INTERNAL',
        value: 'app-z04308de2-back-end',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '04308de2-af27-405f-9e95-570fa94ed577',
        service_name: 'back-end-A',
        service_type: 'CONTAINER',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'f41a84e2-5ebd-457f-881c-b47b89106005',
        created_at: '2023-10-25T09:18:49.511393Z',
        updated_at: '2023-10-25T09:18:49.511395Z',
        key: 'BACKEND_URL',
        value: 'QOVERY_CONTAINER_Z04308DE2_HOST_INTERNAL',
        mount_path: null,
        scope: 'ENVIRONMENT',
        overridden_variable: null,
        aliased_variable: {
          id: 'c0277184-1fe0-4f17-b09a-58eee2c05701',
          key: 'QOVERY_CONTAINER_Z04308DE2_HOST_INTERNAL',
          value: 'app-z04308de2-back-end',
          scope: 'BUILT_IN',
          variable_type: 'BUILT_IN',
          mount_path: null,
        },
        variable_type: 'ALIAS',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'bf952ee2-1339-47d1-b16a-5296744cdb48',
        created_at: '2023-12-12T13:23:02.569804Z',
        updated_at: '2023-12-12T13:23:02.569806Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_DATABASE_URL',
        value: null,
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: '1c403cc7-8396-471a-9090-a7ff4081e4e9',
        created_at: '2023-12-12T13:23:02.57335Z',
        updated_at: '2023-12-12T13:23:02.573352Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_DATABASE_URL_INTERNAL',
        value: null,
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: '27ef3d41-f6d3-43c8-a8b0-5db51f27bdb4',
        created_at: '2023-12-12T13:23:02.565966Z',
        updated_at: '2023-12-12T13:23:02.565968Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_DEFAULT_DATABASE_NAME',
        value: 'postgres',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'eee6cc5d-4b66-40fe-9141-c3f9e4b7330d',
        created_at: '2023-12-12T13:23:02.576609Z',
        updated_at: '2023-12-12T13:23:02.57661Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_HOST',
        value: 'z90eabf2d-postgresql.zc531a994.rustrocks.cloud',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'e2ff86ec-1d4d-41dc-a5fb-afde7e4ab67b',
        created_at: '2023-12-12T13:23:02.583035Z',
        updated_at: '2023-12-12T13:23:02.583036Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_HOST_INTERNAL',
        value: 'z90eabf2d-postgresql',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'baeb88f8-b722-4084-b013-d46dc8243195',
        created_at: '2023-12-12T13:23:02.554803Z',
        updated_at: '2023-12-12T13:23:02.554805Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_LOGIN',
        value: 'postgres',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'bce8fc9f-5457-41ec-bfd2-89e4fd89c4b6',
        created_at: '2023-12-12T13:23:02.559295Z',
        updated_at: '2023-12-12T13:23:02.559297Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_PASSWORD',
        value: null,
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: '71f6c767-a025-4da6-90bc-a59ddf2087c8',
        created_at: '2023-12-12T13:23:02.562537Z',
        updated_at: '2023-12-12T13:23:02.562538Z',
        key: 'QOVERY_POSTGRESQL_Z90EABF2D_PORT',
        value: '5432',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '90eabf2d-749f-433b-a032-e42e97f18d23',
        service_name: 'database',
        service_type: 'DATABASE',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'f2ae4319-2023-415a-8b1a-e32cbe970c80',
        created_at: '2023-10-25T09:00:13.414589Z',
        updated_at: '2023-10-25T09:00:13.41459Z',
        key: 'QOVERY_APPLICATION_Z037C9E87_HOST_EXTERNAL',
        value: 'z55867c71-z9b3da566-gtw.zc531a994.rustrocks.cloud',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
        service_name: 'FRONT-END',
        service_type: 'APPLICATION',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '84a8a165-a38b-441a-8b53-ff6c96c6e436',
        created_at: '2023-10-25T09:00:13.423759Z',
        updated_at: '2023-10-25T09:00:13.423761Z',
        key: 'QOVERY_APPLICATION_Z037C9E87_HOST_INTERNAL',
        value: 'app-z037c9e87-front-end',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
        service_name: 'FRONT-END',
        service_type: 'APPLICATION',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'a473d878-967c-4c6a-9e5c-dcf29c04b0c8',
        created_at: '2023-12-20T13:49:40.985841Z',
        updated_at: '2023-12-20T13:49:40.985842Z',
        key: 'QOVERY_APPLICATION_Z9C0D7C5F_HOST_INTERNAL',
        value: 'app-z9c0d7c5f-http-test',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '9c0d7c5f-2caf-4f6f-a6c4-91b8f2265f07',
        service_name: 'http-test',
        service_type: 'APPLICATION',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '84779816-2633-492e-91b2-0dcf35daed1f',
        created_at: '2024-02-07T16:23:22.010144Z',
        updated_at: '2024-02-07T16:23:22.010165Z',
        key: 'QOVERY_APPLICATION_ZCCE9D28F_HOST_INTERNAL',
        value: 'app-zcce9d28f-http-test-clone',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: 'cce9d28f-d0ab-411f-96bd-f6ccd9566d59',
        service_name: 'http-test-clone',
        service_type: 'APPLICATION',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'a237b478-dae4-4874-9c6d-3719bc38e8cb',
        created_at: '2023-10-25T09:54:12.946957Z',
        updated_at: '2023-10-25T09:54:12.946959Z',
        key: 'QOVERY_JOB_ACTION',
        value: 'START',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'cc4145b9-7e6a-40cb-b68d-fde84b3010f1',
        created_at: '2023-10-25T09:54:12.937088Z',
        updated_at: '2023-10-25T09:54:12.93709Z',
        key: 'QOVERY_JOB_ID',
        value: '33962e52-7883-42fd-8613-85e04229a9b6',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '6d44764d-4dc9-4b8f-981a-feb84d72d211',
        created_at: '2023-10-25T09:54:12.94219Z',
        updated_at: '2023-10-25T09:54:12.942194Z',
        key: 'QOVERY_JOB_NAME',
        value: 'seed_script',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '00a261f6-716a-4f7f-b7cb-44053ff6653f',
        created_at: '2023-10-25T09:54:12.931279Z',
        updated_at: '2023-10-25T09:54:12.931281Z',
        key: 'QOVERY_JOB_Z33962E52_ENVIRONMENT_NAME',
        value: 'production',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '9a0bf2cc-3783-4cd3-b3ce-16c474a66db6',
        created_at: '2023-10-25T09:54:12.96055Z',
        updated_at: '2023-10-25T09:54:12.960552Z',
        key: 'QOVERY_JOB_Z33962E52_GIT_BRANCH',
        value: 'main',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'c755c763-daab-44e3-b4c8-4b0c3773ad71',
        created_at: '2023-10-25T09:54:12.951523Z',
        updated_at: '2023-10-25T09:54:12.951526Z',
        key: 'QOVERY_JOB_Z33962E52_GIT_COMMIT_ID',
        value: 'e93b1e5af71af2e5397893d6a4353e7bc8348129',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'e77d73db-a3b5-4876-b714-89d03e51f6ac',
        created_at: '2023-10-25T09:58:34.20839Z',
        updated_at: '2024-02-07T16:24:04.913956Z',
        key: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_PASSWORD',
        value: null,
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: '4f60c353-89b9-48e6-acf6-8a7b5d355d6a',
        created_at: '2023-10-25T09:58:34.220801Z',
        updated_at: '2023-10-25T09:58:34.220804Z',
        key: 'DB_PASSWORD',
        value: null,
        mount_path: null,
        scope: 'ENVIRONMENT',
        overridden_variable: null,
        aliased_variable: {
          id: 'e77d73db-a3b5-4876-b714-89d03e51f6ac',
          key: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_PASSWORD',
          value: null,
          scope: 'BUILT_IN',
          variable_type: 'BUILT_IN',
          mount_path: null,
        },
        variable_type: 'ALIAS',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: 'ade79b9c-8515-47f2-8069-83c1e8c35c4d',
        created_at: '2023-10-25T09:58:34.202571Z',
        updated_at: '2024-02-07T16:24:04.904214Z',
        key: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_USERNAME',
        value: 'admin2',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'seed_script',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '810e3ca6-6e42-40b1-952a-4cfcef3c9fd1',
        created_at: '2023-10-25T09:58:34.216404Z',
        updated_at: '2023-10-25T09:58:34.216407Z',
        key: 'DB_USERNAME',
        value: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_USERNAME',
        mount_path: null,
        scope: 'ENVIRONMENT',
        overridden_variable: null,
        aliased_variable: {
          id: 'ade79b9c-8515-47f2-8069-83c1e8c35c4d',
          key: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_USERNAME',
          value: 'admin2',
          scope: 'BUILT_IN',
          variable_type: 'BUILT_IN',
          mount_path: null,
        },
        variable_type: 'ALIAS',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'd5786a01-59ed-4c45-bfd4-b985fd971b01',
        created_at: '2023-10-25T08:52:25.790644Z',
        updated_at: '2023-10-25T08:52:25.790645Z',
        key: 'QOVERY_CLOUD_PROVIDER_REGION',
        value: 'eu-west-3',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'df609944-4563-4acd-b949-f4a3d833443d',
        created_at: '2023-10-25T08:52:25.77897Z',
        updated_at: '2023-10-25T08:52:25.778972Z',
        key: 'QOVERY_ENVIRONMENT_ID',
        value: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'ec3bf322-8f3b-4c55-8baa-de0a779afc9e',
        created_at: '2023-10-25T08:52:25.797914Z',
        updated_at: '2023-10-25T08:52:25.797915Z',
        key: 'QOVERY_ENVIRONMENT_NAME',
        value: 'production',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'ba7c9785-53ee-4c3a-a6d0-9371c8076fdd',
        created_at: '2023-11-20T14:34:42.759344Z',
        updated_at: '2023-11-20T14:34:42.759344Z',
        key: 'QOVERY_ENVIRONMENT_TYPE',
        value: 'PRODUCTION',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '7befd4fb-d304-420c-a624-4938ae6d1c5e',
        created_at: '2023-10-25T08:52:25.794237Z',
        updated_at: '2023-10-25T08:52:25.794239Z',
        key: 'QOVERY_KUBERNETES_CLUSTER_NAME',
        value: 'qovery-zc531a994',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'a65013d7-7305-49e1-b8bf-34a5a343e596',
        created_at: '2023-10-25T08:52:25.786912Z',
        updated_at: '2023-10-25T08:52:25.786915Z',
        key: 'QOVERY_KUBERNETES_NAMESPACE_NAME',
        value: 'z55867c71-production',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'a66b17ab-4b18-467f-b6a5-379b4bbea52e',
        created_at: '2023-10-25T08:52:25.782961Z',
        updated_at: '2023-10-25T08:52:25.782964Z',
        key: 'QOVERY_PROJECT_ID',
        value: 'cf021d82-2c5e-41de-96eb-eb69c022eddc',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '10e0c70e-cc7f-4503-bf8b-a595603368e3',
        created_at: '2024-02-14T08:49:04.684947Z',
        updated_at: '2024-02-14T08:49:04.684949Z',
        key: 'dasdas',
        value: null,
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: '57658166-0318-430c-8d8a-610a34d98910',
        created_at: '2023-06-16T14:54:17.234302Z',
        updated_at: '2023-07-03T13:41:40.23109Z',
        key: 'myvar_project',
        value: 'abc',
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'b9580421-64f3-494f-9b46-564500c90054',
        created_at: '2023-11-15T10:57:54.177781Z',
        updated_at: '2023-11-15T10:57:54.177785Z',
        key: 'test',
        value: 'dsfg',
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'f001a80e-525f-49d9-9d6a-cb399b1171ca',
        created_at: '2023-04-21T09:09:15.292259Z',
        updated_at: '2023-04-21T09:12:50.440708Z',
        key: 'test_role',
        value: 'dsadsa2SSS',
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
    ],
  }),
}))

describe('OutputVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OutputVariables serviceId="33962e52-7883-42fd-8613-85e04229a9b6" />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<OutputVariables serviceId="33962e52-7883-42fd-8613-85e04229a9b6" />)
    expect(baseElement).toMatchSnapshot()
  })
})