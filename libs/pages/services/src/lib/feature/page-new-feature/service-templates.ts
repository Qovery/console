import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Angular from 'devicon/icons/angularjs/angularjs-original.svg'
import Apache from 'devicon/icons/apache/apache-original.svg'
import ApacheKafka from 'devicon/icons/apachekafka/apachekafka-original.svg'
import Cloudflare from 'devicon/icons/cloudflare/cloudflare-original.svg'
import Couchbase from 'devicon/icons/couchbase/couchbase-original.svg'
import Docker from 'devicon/icons/docker/docker-original.svg'
import Elasticsearch from 'devicon/icons/elasticsearch/elasticsearch-original.svg'
import FastAPI from 'devicon/icons/fastapi/fastapi-original.svg'
import Flask from 'devicon/icons/flask/flask-original.svg'
import Golang from 'devicon/icons/go/go-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Grafana from 'devicon/icons/grafana/grafana-original.svg'
import Helm from 'devicon/icons/helm/helm-original.svg'
import Java from 'devicon/icons/java/java-original.svg'
import MongoDB from 'devicon/icons/mongodb/mongodb-original.svg'
import MySQL from 'devicon/icons/mysql/mysql-original.svg'
import NestJS from 'devicon/icons/nestjs/nestjs-original.svg'
import NextJS from 'devicon/icons/nextjs/nextjs-original.svg'
import Nginx from 'devicon/icons/nginx/nginx-original.svg'
import Node from 'devicon/icons/nodejs/nodejs-original.svg'
import NuxtJS from 'devicon/icons/nuxtjs/nuxtjs-original.svg'
import PostgreSQL from 'devicon/icons/postgresql/postgresql-original.svg'
import Prometheus from 'devicon/icons/prometheus/prometheus-original.svg'
import Pulumi from 'devicon/icons/pulumi/pulumi-original.svg'
import Python from 'devicon/icons/python/python-original.svg'
import RabbitMQ from 'devicon/icons/rabbitmq/rabbitmq-original.svg'
import Rails from 'devicon/icons/rails/rails-plain.svg'
import React from 'devicon/icons/react/react-original.svg'
import Redis from 'devicon/icons/redis/redis-original.svg'
import Ruby from 'devicon/icons/ruby/ruby-original.svg'
import Rust from 'devicon/icons/rust/rust-original.svg'
import Spring from 'devicon/icons/spring/spring-original.svg'
import Terraform from 'devicon/icons/terraform/terraform-original.svg'
import Vue from 'devicon/icons/vuejs/vuejs-original.svg'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactElement } from 'react'
import { type IconURI } from '@qovery/domains/services/feature'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { TemplateIds } from '@qovery/shared/util-services'

const Qovery = '/assets/logos/logo-icon.svg'
const Datadog = '/assets/devicon/datadog.svg'
const Crossplane = '/assets/devicon/crossplane.svg'
const Kubecost = '/assets/devicon/kubecost.svg'
const Windmill = '/assets/devicon/windmill.svg'
const Temporal = '/assets/devicon/temporal.svg'
const CloudFormation = '/assets/devicon/cloudformation.svg'
const Lambda = '/assets/devicon/lambda.svg'
const S3 = '/assets/devicon/s3.svg'

export enum TagsEnum {
  IAC = 'IAC',
  FRONT_END = 'FRONT_END',
  BACK_END = 'BACK_END',
  DATA_STORAGE = 'DATA_STORAGE',
  OTHER = 'OTHER',
}

export type ServiceTemplateType = {
  title: string
  description: string
  icon: string | ReactElement
  icon_uri?: IconURI
  tag?: keyof typeof TagsEnum
  slug?: string
  link?: string
  dockerfile?: string
  additional_dockerfile_files?: string[]
  type?: keyof typeof ServiceTypeEnum
  options?: ServiceTemplateOptionType[]
  cloud_provider?: keyof typeof CloudProviderEnum
  template_id?: (typeof TemplateIds)[keyof typeof TemplateIds]
}

export type ServiceTemplateOptionType = {
  slug: string
  title: string
  description: string
  icon: string
  icon_uri: IconURI
  type: keyof typeof ServiceTypeEnum
  dockerfile?: string
  additional_dockerfile_files?: string[]
  lifecycle_job_options?: LifecycleJobOptionsType
  recommended?: boolean
  cloud_provider?: keyof typeof CloudProviderEnum
  template_id?: (typeof TemplateIds)[keyof typeof TemplateIds]
}

export type LifecycleJobOptionsType = {
  start_command?: string
  stop_command?: string
  delete_command?: string
}

export const serviceTemplates: ServiceTemplateType[] = [
  {
    tag: 'DATA_STORAGE',
    slug: 'postgresql',
    title: 'PostgreSQL',
    description: 'PostgreSQL is a powerful, open-source object-relational database system.',
    icon: PostgreSQL,
    icon_uri: 'app://qovery-console/postgresql',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a PostgreSQL database using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/postgresql',
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a PostgreSQL database using a managed service.',
        icon: AWS,
        icon_uri: 'app://qovery-console/postgresql',
        type: 'DATABASE',
        cloud_provider: 'AWS',
      },
      {
        slug: 'managed-aws-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'AWS RDS via Terraform',
        description:
          'Create a PostgreSQL database using AWS RDS via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/postgresql',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-terraform/Dockerfile',
        additional_dockerfile_files: [
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-terraform/main.tf',
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-terraform/variables.tf',
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-terraform/output.tf',
        ],
        lifecycle_job_options: {
          start_command:
            '["-c", "terraform plan && terraform apply -auto-approve && terraform output -json > /qovery-output/qovery-output.json"]',
          stop_command: '',
          delete_command: '["-c", "terraform plan && terraform destroy -auto-approve"]',
        },
      },
      {
        slug: 'managed-aws-cloudformation',
        template_id: TemplateIds.CLOUDFORMATION,
        title: 'AWS RDS via Cloudformation',
        description:
          'Create a PostgreSQL database using AWS RDS via Cloudformation. Resource managed via a Qovery Lifecycle Job specialized for Cloudformation.',
        icon: AWS,
        icon_uri: 'app://qovery-console/postgresql',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-cloudformation/Dockerfile',
        additional_dockerfile_files: [
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-cloudformation/rds.yml',
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-rds-with-cloudformation/entrypoint.sh',
        ],
        lifecycle_job_options: {
          start_command:
            '["aws cloudformation deploy --template-file rds.yml --stack-name $STACK_NAME --parameter-overrides QoveryEnvironmentId=$QOVERY_ENVIRONMENT_ID --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM && aws cloudformation describe-stacks --stack-name $STACK_NAME --query \'Stacks[0].Outputs\' --output json > /qovery-output/qovery-output.json"]',
          stop_command: '',
          delete_command: '["aws cloudformation delete-stack --stack-name $STACK_NAME"]',
        },
      },
      {
        slug: 'managed-gcp-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'Managed via Terraform',
        description:
          'Create a PostgreSQL database using Google Cloud SQL via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: GCP,
        icon_uri: 'app://qovery-console/postgresql',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'redis',
    title: 'Redis',
    description: 'Redis is an open-source in-memory data structure store.',
    icon: Redis,
    icon_uri: 'app://qovery-console/redis',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a Redis database using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/redis',
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a Redis database using a managed service.',
        icon: AWS,
        icon_uri: 'app://qovery-console/redis',
        cloud_provider: 'AWS',
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'AWS ElastiCache via Terraform',
        description:
          'Create a Redis database using AWS ElastiCache via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/redis',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'Managed via Terraform',
        description:
          'Create a Redis database using Google Cloud Memorystore via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/redis',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'IAC',
    slug: 'terraform',
    title: 'Terraform',
    template_id: TemplateIds.TERRAFORM,
    description: 'Terraform is an open-source infrastructure as code software tool.',
    icon: Terraform,
    icon_uri: 'app://qovery-console/terraform',
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'IAC',
    slug: 'cloudformation',
    title: 'CloudFormation',
    template_id: TemplateIds.CLOUDFORMATION,
    description:
      'AWS CloudFormation is a service provided by Amazon Web Services that enables users to model and manage infrastructure resources in an automated and secure manner.',
    icon: CloudFormation,
    icon_uri: 'app://qovery-console/cloudformation',
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'IAC',
    slug: 'pulumi',
    title: 'Pulumi',
    description:
      "Pulumi's open source infrastructure as code SDK enables you to create, deploy, and manage infrastructure on any cloud, using your favorite languages.",
    icon: Pulumi,
    icon_uri: 'app://qovery-console/pulumi',
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'FRONT_END',
    slug: 'react',
    title: 'React',
    description: 'React is a JavaScript library for building user interfaces.',
    icon: React,
    icon_uri: 'app://qovery-console/react',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a React application using a container with Nginx.',
        icon: Docker,
        icon_uri: 'app://qovery-console/react',
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description:
          'Expose a React application through AWS CloudFront and S3. Resource managed via a Qovery Lifecycle Job.',
        icon: AWS,
        icon_uri: 'app://qovery-console/react',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'FRONT_END',
    slug: 'vue',
    title: 'Vue',
    description: 'Vue.js is a progressive framework for building user interfaces.',
    icon: Vue,
    icon_uri: 'app://qovery-console/vue',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a Vue application using a container with Nginx.',
        icon: Docker,
        icon_uri: 'app://qovery-console/vue',
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description:
          'Expose a Vue application through AWS CloudFront and S3. Resource managed via a Qovery Lifecycle Job.',
        icon: AWS,
        icon_uri: 'app://qovery-console/vue',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'FRONT_END',
    slug: 'angular',
    title: 'Angular',
    description:
      'Angular is a platform and framework for building single-page client applications using HTML and TypeScript.',
    icon: Angular,
    icon_uri: 'app://qovery-console/angular',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose an Angular application using a container with Nginx.',
        icon: Docker,
        icon_uri: 'app://qovery-console/angular',
        type: 'APPLICATION',
        recommended: true,
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description:
          'Expose an Angular application through AWS CloudFront and S3. Resource managed via a Qovery Lifecycle Job.',
        icon: AWS,
        icon_uri: 'app://qovery-console/angular',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'BACK_END',
    slug: 'nodejs',
    title: 'Node.js',
    description: 'Node.js is an open-source, cross-platform, back-end JavaScript runtime environment.',
    icon: Node,
    icon_uri: 'app://qovery-console/node',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'aws-lambda',
    title: 'AWS Lambda',
    description: 'AWS Lambda lets you run code without provisioning or managing servers.',
    icon: Lambda,
    icon_uri: 'app://qovery-console/lambda',
    cloud_provider: 'AWS',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'cloudformation',
        template_id: TemplateIds.CLOUDFORMATION,
        title: 'Cloudformation',
        description:
          'Deploy an AWS Lambda function using CloudFormation. Resource managed via a Qovery Lifecycle Job specialized for Cloudformation.',
        icon: Lambda,
        icon_uri: 'app://qovery-console/lambda',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'Terraform',
        description:
          'Deploy an AWS Lambda function using Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/aws',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'mysql',
    title: 'MySQL',
    description: 'MySQL is an open-source relational database management system.',
    icon: MySQL,
    icon_uri: 'app://qovery-console/mysql',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a MySQL database using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/mysql',
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a MySQL database using a managed service.',
        icon: AWS,
        icon_uri: 'app://qovery-console/mysql',
        cloud_provider: 'AWS',
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'AWS RDS via Terraform',
        description:
          'Create a MySQL database using AWS RDS via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/mysql',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-aws-cloudformation',
        template_id: TemplateIds.CLOUDFORMATION,
        title: 'AWS RDS via Cloudformation',
        description:
          'Create a MySQL database using AWS RDS via Cloudformation. Resource managed via a Qovery Lifecycle Job specialized for Cloudformation.',
        icon: AWS,
        icon_uri: 'app://qovery-console/mysql',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'Managed via Terraform',
        description:
          'Create a MySQL database using Google Cloud SQL via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/mysql',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'mongodb',
    title: 'MongoDB',
    description: 'MongoDB is a open-source document-oriented NoSQL database.',
    icon: MongoDB,
    icon_uri: 'app://qovery-console/mongodb',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a MongoDB database using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/mongodb',
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a MongoDB database using a managed service.',
        icon: AWS,
        icon_uri: 'app://qovery-console/mongodb',
        type: 'DATABASE',
        cloud_provider: 'AWS',
      },
      {
        slug: 'managed-aws-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'AWS DocumentDB via Terraform',
        description:
          'Create a MongoDB database using AWS DocumentDB via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/mongodb',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'Managed via Terraform',
        description:
          'Create a MongoDB database using Google Cloud Firestore via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/mongodb',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'apachekafka',
    title: 'Apache Kafka',
    description: 'Apache Kafka is an open-source distributed event streaming platform',
    icon: ApacheKafka,
    icon_uri: 'app://qovery-console/apachekafka',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create an Apache Kafka using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/apachekafka',
        type: 'CONTAINER',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'helm',
        title: 'Helm chart',
        description: 'Create an Apache Kafka using an Helm chart.',
        icon: Helm,
        icon_uri: 'app://qovery-console/apachekafka',
        type: 'HELM',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'rabbitmq',
    title: 'Rabbit MQ',
    description: 'RabbitMQ is a reliable and mature messaging and streaming broker.',
    icon: RabbitMQ,
    icon_uri: 'app://qovery-console/rabbitmq',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a RabbitMQ using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/rabbitmq',
        type: 'CONTAINER',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'helm',
        title: 'Helm chart',
        description: 'Create a RabbitMQ using an Helm chart.',
        icon: Helm,
        icon_uri: 'app://qovery-console/rabbitmq',
        type: 'HELM',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'OTHER',
    slug: 'kubecost',
    title: 'Kubecost',
    description: 'Kubecost is an open-source cost monitoring tool for Kubernetes.',
    icon: Kubecost,
    icon_uri: 'app://qovery-console/kubecost',
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'datadog',
    title: 'Datadog',
    description: 'Datadog is an observability platform for cloud-scale applications.',
    icon: Datadog,
    icon_uri: 'app://qovery-console/datadog',
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'spring',
    title: 'Spring',
    description: 'Spring is an open-source application framework for Java.',
    icon: Spring,
    icon_uri: 'app://qovery-console/spring',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'FRONT_END',
    slug: 'nextjs',
    title: 'NextJS',
    description: 'NextJS is a React framework with hybrid static & server rendering.',
    icon: NextJS,
    icon_uri: 'app://qovery-console/nextjs',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a NextJS application using a container with Nginx.',
        icon: Docker,
        icon_uri: 'app://qovery-console/nextjs',
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description:
          'Expose a NextJS application through AWS CloudFront and S3. Resource managed via a Qovery Lifecycle Job specialized for Cloudformation.',
        icon: AWS,
        icon_uri: 'app://qovery-console/nextjs',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'FRONT_END',
    slug: 'nuxtjs',
    title: 'NuxtJS',
    description: 'NuxtJS is a Vue framework with hybrid static & server rendering.',
    icon: NuxtJS,
    icon_uri: 'app://qovery-console/nuxtjs',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a NuxtJS application using a container with Nginx.',
        icon: Docker,
        icon_uri: 'app://qovery-console/nuxtjs',
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description:
          'Expose a NuxtJS application through AWS CloudFront and S3. Resource managed via a Qovery Lifecycle Job specialized for Cloudformation.',
        icon: AWS,
        icon_uri: 'app://qovery-console/nuxtjs',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'couchbase',
    title: 'Couchbase',
    description:
      'Couchbase is an open-source, distributed, NoSQL document-oriented database. Resource managed via a Qovery Lifecycle Job.',
    icon: Couchbase,
    icon_uri: 'app://qovery-console/couchbase',
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'rust',
    title: 'Rust',
    description: 'Rust is a multi-paradigm system programming language focused on safety and performance.',
    icon: Rust,
    icon_uri: 'app://qovery-console/rust',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'golang',
    title: 'Go',
    description:
      'Go is an open-source programming language that makes it easy to build simple, reliable, and efficient software.',
    icon: Golang,
    icon_uri: 'app://qovery-console/golang',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'nginx',
    title: 'NGINX',
    description:
      'NGINX is a web server that can also be used as a reverse proxy, load balancer, mail proxy, and HTTP cache.',
    icon: Nginx,
    icon_uri: 'app://qovery-console/nginx',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'caddy',
    title: 'Caddy',
    description: 'Caddy is a powerful, enterprise-ready, open source web server with automatic HTTPS written in Go.',
    icon: Golang,
    icon_uri: 'app://qovery-console/golang',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'docker',
    title: 'Docker',
    description: 'Docker is a platform designed to help developers build, share, and run container applications.',
    icon: Docker,
    icon_uri: 'app://qovery-console/docker',
    options: [
      {
        slug: 'dockerfile',
        title: 'Dockerfile',
        description:
          'Dockerfiles are text files containing a series of instructions that the Docker daemon follows to build a container image.',
        icon: Docker,
        icon_uri: 'app://qovery-console/docker',
        type: 'APPLICATION',
      },
      {
        slug: 'docker-container',
        title: 'Docker container',
        description:
          'A Docker container image is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings.',
        icon: Docker,
        icon_uri: 'app://qovery-console/docker',
        type: 'CONTAINER',
      },
    ],
  },
  {
    tag: 'BACK_END',
    slug: 'rails',
    title: 'Rails',
    description: 'Rails is a web application framework written in Ruby.',
    icon: Rails,
    icon_uri: 'app://qovery-console/rails',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'ruby',
    title: 'Ruby',
    description: 'Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.',
    icon: Ruby,
    icon_uri: 'app://qovery-console/ruby',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'nestjs',
    title: 'NestJS',
    description:
      'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
    icon: NestJS,
    icon_uri: 'app://qovery-console/nestjs',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'python',
    title: 'Python',
    description: 'Python is a programming language that lets you work quickly and integrate systems more effectively.',
    icon: Python,
    icon_uri: 'app://qovery-console/python',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'FRONT_END',
    slug: 'flask',
    title: 'Flask',
    description: 'Flask is a lightweight WSGI web application framework.',
    icon: Flask,
    icon_uri: 'app://qovery-console/flask',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'fastapi',
    title: 'FastAPI',
    description: 'FastAPI is a modern, fast , web framework for building APIs based on standard Python type hints.',
    icon: FastAPI,
    icon_uri: 'app://qovery-console/fastapi',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'replibyte',
    title: 'Replibyte',
    description:
      'Replibyte is a tool written in Rust by the Qovery team to seed databases with production data without sensitive data. Resource managed via a Qovery Lifecycle Job.',
    icon: Rust,
    icon_uri: 'app://qovery-console/rust',
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'cloudflare-worker',
    title: 'Cloudflare Worker',
    description:
      'Cloudflare Worker is a serverless platform that enables you to write and deploy code on Cloudflare’s edge. Resource managed via a Qovery Lifecycle Job.',
    icon: Cloudflare,
    icon_uri: 'app://qovery-console/cloudflare',
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'BACK_END',
    slug: 'java',
    title: 'Java',
    description: 'Java is a high-level, class-based, object-oriented programming language.',
    icon: Java,
    icon_uri: 'app://qovery-console/java',
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'aws-assume-roles',
    title: 'AWS Assume Roles',
    description: 'AWS Assume Roles is a tool to assume roles for your services on your Kubernetes cluster.',
    icon: AWS,
    icon_uri: 'app://qovery-console/aws',
    type: 'HELM',
    cloud_provider: 'AWS',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'aws-s3',
    title: 'AWS S3',
    description:
      'AWS S3 is an object storage service that offers industry-leading scalability, ' +
      'data availability, security, and performance.',
    icon: S3,
    icon_uri: 'app://qovery-console/s3',
    cloud_provider: 'AWS',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 's3-cli',
        title: 'S3 CLI',
        description: 'Do operations on S3 using the AWS CLI. Resource managed via a Qovery Lifecycle Job.',
        icon: S3,
        icon_uri: 'app://qovery-console/s3',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 's3-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'S3 via Terraform',
        description:
          'Do operations on S3 using Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/aws',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 's3-cloudformation',
        template_id: TemplateIds.CLOUDFORMATION,
        title: 'S3 via Cloudformation',
        description:
          'Do operations on S3 using Cloudformation. Resource managed via a Qovery Lifecycle Job specialized for Cloudformation.',
        icon: S3,
        icon_uri: 'app://qovery-console/s3',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'gcp-bigquery',
    title: 'GCP BigQuery',
    description:
      'GCP BigQuery is a serverless, highly scalable, and cost-effective multi-cloud data warehouse ' +
      'designed for business agility.',
    icon: GCP,
    icon_uri: 'app://qovery-console/gcp',
    cloud_provider: 'GCP',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'bigquery-cli',
        title: 'BigQuery CLI',
        description: 'Do operations on GCP BigQuery using the GCP CLI. Resource managed via a Qovery Lifecycle Job.',
        icon: GCP,
        icon_uri: 'app://qovery-console/gcp',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'bigquery-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'BigQuery via Terraform',
        description:
          'Do operations on BigQuery using Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/gcp',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'OTHER',
    slug: 'windmill',
    title: 'Windmill',
    description: 'Windmill is an open-source workflow orchestration engine written in Rust.',
    icon: Windmill,
    icon_uri: 'app://qovery-console/windmill',
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'temporal',
    title: 'Temporal',
    description: 'Temporal is an open-source, stateful, and scalable workflow orchestration engine.',
    icon: Temporal,
    icon_uri: 'app://qovery-console/temporal',
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'OTHER',
    slug: 'grafana',
    title: 'Grafana',
    description: 'Grafana is the open source analytics & monitoring solution for every database.',
    icon: Grafana,
    icon_uri: 'app://qovery-console/grafana',
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a Grafana using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/grafana',
        type: 'CONTAINER',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'helm',
        title: 'Helm chart',
        description: 'Create a Grafana using an Helm chart.',
        icon: Helm,
        icon_uri: 'app://qovery-console/grafana',
        type: 'HELM',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'OTHER',
    slug: 'apache',
    title: 'Apache',
    description:
      'An open-source monitoring system with a dimensional data model, flexible query language, efficient time series database and modern alerting approach.',
    icon: Apache,
    icon_uri: 'app://qovery-console/apache',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a Apache using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/apache',
        type: 'CONTAINER',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'helm',
        title: 'Helm chart',
        description: 'Create a Apache using an Helm chart.',
        icon: Helm,
        icon_uri: 'app://qovery-console/apache',
        type: 'HELM',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'OTHER',
    slug: 'prometheus',
    title: 'Prometheus',
    description:
      'An open-source monitoring system with a dimensional data model, flexible query language, efficient time series database and modern alerting approach.',
    icon: Prometheus,
    icon_uri: 'app://qovery-console/prometheus',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a Prometheus using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/prometheus',
        type: 'CONTAINER',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'helm',
        title: 'Helm chart',
        description: 'Create a Prometheus using an Helm chart.',
        icon: Helm,
        icon_uri: 'app://qovery-console/prometheus',
        type: 'HELM',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    tag: 'IAC',
    slug: 'crossplane',
    title: 'Crossplane',
    description:
      'Crossplane is an open-source Kubernetes add-on that extends your cluster with the ability to provision services and infrastructure.',
    icon: Crossplane,
    icon_uri: 'app://qovery-console/crossplane',
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    tag: 'DATA_STORAGE',
    slug: 'elasticsearch',
    title: 'Elasticsearch',
    description:
      'Elasticsearch is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases.',
    icon: Elasticsearch,
    icon_uri: 'app://qovery-console/elasticsearch',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create an Elasticsearch database using a container.',
        icon: Docker,
        icon_uri: 'app://qovery-console/elasticsearch',
        type: 'CONTAINER',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create an Elasticsearch database using a managed service.',
        icon: AWS,
        icon_uri: 'app://qovery-console/elasticsearch',
        cloud_provider: 'AWS',
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'AWS Elasticsearch via Terraform',
        description:
          'Create an Elasticsearch database using AWS Elasticsearch via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/elasticsearch',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'AWS',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        template_id: TemplateIds.TERRAFORM,
        title: 'Managed via Terraform',
        description:
          'Create an Elasticsearch database using Google Cloud Elasticsearch via Terraform. Resource managed via a Qovery Lifecycle Job specialized for Terraform.',
        icon: Terraform,
        icon_uri: 'app://qovery-console/elasticsearch',
        type: 'LIFECYCLE_JOB',
        cloud_provider: 'GCP',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
]
