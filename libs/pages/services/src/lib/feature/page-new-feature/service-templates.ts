import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Angular from 'devicon/icons/angularjs/angularjs-original.svg'
import Cloudflare from 'devicon/icons/cloudflare/cloudflare-original.svg'
import Couchbase from 'devicon/icons/couchbase/couchbase-original.svg'
import Docker from 'devicon/icons/docker/docker-original.svg'
import Elasticsearch from 'devicon/icons/elasticsearch/elasticsearch-original.svg'
import FastAPI from 'devicon/icons/fastapi/fastapi-original.svg'
import Flask from 'devicon/icons/flask/flask-original.svg'
import Golang from 'devicon/icons/go/go-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Java from 'devicon/icons/java/java-original.svg'
import MongoDB from 'devicon/icons/mongodb/mongodb-original.svg'
import MySQL from 'devicon/icons/mysql/mysql-original.svg'
import NestJS from 'devicon/icons/nestjs/nestjs-original.svg'
import NextJS from 'devicon/icons/nextjs/nextjs-original.svg'
import Nginx from 'devicon/icons/nginx/nginx-original.svg'
import Node from 'devicon/icons/nodejs/nodejs-original.svg'
import PostgreSQL from 'devicon/icons/postgresql/postgresql-original.svg'
import Python from 'devicon/icons/python/python-original.svg'
import Rails from 'devicon/icons/rails/rails-plain.svg'
import React from 'devicon/icons/react/react-original.svg'
import Redis from 'devicon/icons/redis/redis-original.svg'
import Ruby from 'devicon/icons/ruby/ruby-original.svg'
import Rust from 'devicon/icons/rust/rust-original.svg'
import Spring from 'devicon/icons/spring/spring-original.svg'
import Terraform from 'devicon/icons/terraform/terraform-original.svg'
import Vue from 'devicon/icons/vuejs/vuejs-original.svg'
import { type ReactElement } from 'react'
import { type ServiceTypeEnum } from '@qovery/shared/enums'

const Qovery = '/assets/logos/logo-icon.svg'
const Datadog = '/assets/devicon/datadog.svg'
const Crossplane = '/assets/devicon/crossplane.svg'
const Kubecost = '/assets/devicon/kubecost.svg'
const Windmill = '/assets/devicon/windmill.svg'
const Temporal = '/assets/devicon/temporal.svg'

export type ServiceTemplateType = {
  title: string
  description: string
  icon: string | ReactElement
  slug?: string
  link?: string
  dockerfile?: string
  additional_dockerfile_files?: string[]
  type?: keyof typeof ServiceTypeEnum
  options?: ServiceTemplateOptionType[]
}

export type ServiceTemplateOptionType = {
  slug: string
  title: string
  description: string
  icon: string
  type: keyof typeof ServiceTypeEnum
  dockerfile?: string
  additional_dockerfile_files?: string[]
  lifecycle_job_options?: LifecycleJobOptionsType
}

export type LifecycleJobOptionsType = {
  start_command?: string
  stop_command?: string
  delete_command?: string
}

export const serviceTemplates: ServiceTemplateType[] = [
  {
    slug: 'postgresql',
    title: 'PostgreSQL',
    description: 'PostgreSQL is a powerful, open-source object-relational database system.',
    icon: PostgreSQL,
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a PostgreSQL database using a container.',
        icon: Docker,
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a PostgreSQL database using a managed service.',
        icon: AWS,
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        title: 'AWS RDS via Terraform',
        description: 'Create a PostgreSQL database using AWS RDS via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
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
        title: 'AWS RDS via Cloudformation',
        description: 'Create a PostgreSQL database using AWS RDS via Cloudformation.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
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
        title: 'Managed via Terraform',
        description: 'Create a PostgreSQL database using Google Cloud SQL via Terraform.',
        icon: GCP,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'redis',
    title: 'Redis',
    description: 'Redis is an open-source in-memory data structure store.',
    icon: Redis,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a Redis database using a container.',
        icon: Docker,
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a Redis database using a managed service.',
        icon: AWS,
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        title: 'AWS ElastiCache via Terraform',
        description: 'Create a Redis database using AWS ElastiCache via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        title: 'Managed via Terraform',
        description: 'Create a Redis database using Google Cloud Memorystore via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'terraform',
    title: 'Terraform',
    description: 'Terraform is an open-source infrastructure as code software tool.',
    icon: Terraform,
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'react',
    title: 'React',
    description: 'React is a JavaScript library for building user interfaces.',
    icon: React,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a React application using a container with Nginx.',
        icon: Docker,
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description: 'Expose a React application through AWS CloudFront and S3.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'vue',
    title: 'Vue',
    description: 'Vue.js is a progressive framework for building user interfaces.',
    icon: Vue,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a Vue application using a container with Nginx.',
        icon: Docker,
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description: 'Expose a Vue application through AWS CloudFront and S3.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'angular',
    title: 'Angular',
    description:
      'Angular is a platform and framework for building single-page client applications using HTML and TypeScript.',
    icon: Angular,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose an Angular application using a container with Nginx.',
        icon: Docker,
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description: 'Expose an Angular application through AWS CloudFront and S3.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'nodejs',
    title: 'Node.js',
    description: 'Node.js is an open-source, cross-platform, back-end JavaScript runtime environment.',
    icon: Node,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-lambda',
    title: 'AWS Lambda',
    description: 'AWS Lambda lets you run code without provisioning or managing servers.',
    icon: AWS,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'cloudformation',
        title: 'Cloudformation',
        description: 'Deploy an AWS Lambda function using CloudFormation.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'terraform',
        title: 'Terraform',
        description: 'Deploy an AWS Lambda function using Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'mysql',
    title: 'MySQL',
    description: 'MySQL is an open-source relational database management system.',
    icon: MySQL,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a MySQL database using a container.',
        icon: Docker,
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a MySQL database using a managed service.',
        icon: AWS,
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        title: 'AWS RDS via Terraform',
        description: 'Create a MySQL database using AWS RDS via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-aws-cloudformation',
        title: 'AWS RDS via Cloudformation',
        description: 'Create a MySQL database using AWS RDS via Cloudformation.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        title: 'Managed via Terraform',
        description: 'Create a MySQL database using Google Cloud SQL via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'mongodb',
    title: 'MongoDB',
    description: 'MongoDB is a open-source document-oriented NoSQL database.',
    icon: MongoDB,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create a MongoDB database using a container.',
        icon: Docker,
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create a MongoDB database using a managed service.',
        icon: AWS,
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        title: 'AWS DocumentDB via Terraform',
        description: 'Create a MongoDB database using AWS DocumentDB via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        title: 'Managed via Terraform',
        description: 'Create a MongoDB database using Google Cloud Firestore via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'kubecost',
    title: 'Kubecost',
    description: 'Kubecost is an open-source cost monitoring tool for Kubernetes.',
    icon: Kubecost,
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'datadog',
    title: 'Datadog',
    description: 'Datadog is an observability platform for cloud-scale applications.',
    icon: Datadog,
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'spring',
    title: 'Spring',
    description: 'Spring is an open-source application framework for Java.',
    icon: Spring,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nextjs',
    title: 'NextJS',
    description: 'NextJS is a React framework with hybrid static & server rendering.',
    icon: NextJS,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Expose a NextJS application using a container with Nginx.',
        icon: Docker,
        type: 'APPLICATION',
      },
      {
        slug: 'aws-cloudfront-s3',
        title: 'AWS Cloudfront and S3',
        description: 'Expose a NextJS application through AWS CloudFront and S3.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'couchbase',
    title: 'Couchbase',
    description: 'Couchbase is an open-source, distributed, NoSQL document-oriented database.',
    icon: Couchbase,
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'rust',
    title: 'Rust',
    description: 'Rust is a multi-paradigm system programming language focused on safety and performance.',
    icon: Rust,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'golang',
    title: 'Go',
    description:
      'Go is an open-source programming language that makes it easy to build simple, reliable, and efficient software.',
    icon: Golang,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nginx',
    title: 'NGINX',
    description:
      'NGINX is a web server that can also be used as a reverse proxy, load balancer, mail proxy, and HTTP cache.',
    icon: Nginx,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'caddy',
    title: 'Caddy',
    description: 'Caddy is a powerful, enterprise-ready, open source web server with automatic HTTPS written in Go.',
    icon: Golang,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'rails',
    title: 'Rails',
    description: 'Rails is a web application framework written in Ruby.',
    icon: Rails,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'ruby',
    title: 'Ruby',
    description: 'Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.',
    icon: Ruby,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nestjs',
    title: 'NestJS',
    description:
      'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
    icon: NestJS,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'python',
    title: 'Python',
    description: 'Python is a programming language that lets you work quickly and integrate systems more effectively.',
    icon: Python,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'flask',
    title: 'Flask',
    description: 'Flask is a lightweight WSGI web application framework.',
    icon: Flask,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'fastapi',
    title: 'FastAPI',
    description: 'FastAPI is a modern, fast , web framework for building APIs based on standard Python type hints.',
    icon: FastAPI,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'replibyte',
    title: 'Replibyte',
    description:
      'Replibyte is a tool written in Rust by the Qovery team to seed databases with production data without sensitive data.',
    icon: Rust,
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'cloudflare-worker',
    title: 'Cloudflare Worker',
    description:
      'Cloudflare Worker is a serverless platform that enables you to write and deploy code on Cloudflare’s edge.',
    icon: Cloudflare,
    type: 'LIFECYCLE_JOB',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'java',
    title: 'Java',
    description: 'Java is a high-level, class-based, object-oriented programming language.',
    icon: Java,
    type: 'APPLICATION',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-assume-roles',
    title: 'AWS Assume Roles',
    description: 'AWS Assume Roles is a tool to assume roles for your services on your Kubernetes cluster.',
    icon: AWS,
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-s3',
    title: 'AWS S3',
    description:
      'AWS S3 is an object storage service that offers industry-leading scalability, ' +
      'data availability, security, and performance.',
    icon: AWS,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 's3-cli',
        title: 'S3 CLI',
        description: 'Do operations on AWS S3 using the AWS CLI.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 's3-terraform',
        title: 'S3 via Terraform',
        description: 'Do operations on S3 using Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 's3-cloudformation',
        title: 'S3 via Cloudformation',
        description: 'Do operations on S3 using Cloudformation.',
        icon: AWS,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'gcp-bigquery',
    title: 'GCP BigQuery',
    description:
      'GCP BigQuery is a serverless, highly scalable, and cost-effective multi-cloud data warehouse ' +
      'designed for business agility.',
    icon: GCP,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'bigquery-cli',
        title: 'BigQuery CLI',
        description: 'Do operations on GCP BigQuery using the GCP CLI.',
        icon: GCP,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'bigquery-terraform',
        title: 'BigQuery via Terraform',
        description: 'Do operations on BigQuery using Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
  {
    slug: 'windmill',
    title: 'Windmill',
    description: 'Windmill is an open-source workflow orchestration engine written in Rust.',
    icon: Windmill,
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'temporal',
    title: 'Temporal',
    description: 'Temporal is an open-source, stateful, and scalable workflow orchestration engine.',
    icon: Temporal,
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'crossplane',
    title: 'Crossplane',
    description:
      'Crossplane is an open-source Kubernetes add-on that extends your cluster with the ability to provision services and infrastructure.',
    icon: Crossplane,
    type: 'HELM',
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'elasticsearch',
    title: 'Elasticsearch',
    description:
      'Elasticsearch is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases.',
    icon: Elasticsearch,
    dockerfile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
    options: [
      {
        slug: 'container',
        title: 'Container',
        description: 'Create an Elasticsearch database using a container.',
        icon: Docker,
        type: 'DATABASE',
      },
      {
        slug: 'managed',
        title: 'Managed',
        description: 'Create an Elasticsearch database using a managed service.',
        icon: AWS,
        type: 'DATABASE',
      },
      {
        slug: 'managed-aws-terraform',
        title: 'AWS Elasticsearch via Terraform',
        description: 'Create an Elasticsearch database using AWS Elasticsearch via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
      {
        slug: 'managed-gcp-terraform',
        title: 'Managed via Terraform',
        description: 'Create an Elasticsearch database using Google Cloud Elasticsearch via Terraform.',
        icon: Terraform,
        type: 'LIFECYCLE_JOB',
        dockerfile:
          'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
      },
    ],
  },
]
