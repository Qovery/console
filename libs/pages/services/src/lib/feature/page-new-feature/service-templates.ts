import AWSLambda from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Angular from 'devicon/icons/angularjs/angularjs-original.svg'
import Helm from 'devicon/icons/helm/helm-original.svg'
import MongoDB from 'devicon/icons/mongodb/mongodb-original.svg'
import MySQL from 'devicon/icons/mysql/mysql-original.svg'
import NextJS from 'devicon/icons/nextjs/nextjs-original.svg'
import Node from 'devicon/icons/nodejs/nodejs-original.svg'
import PostgreSQL from 'devicon/icons/postgresql/postgresql-original.svg'
import React from 'devicon/icons/react/react-original.svg'
import Redis from 'devicon/icons/redis/redis-original.svg'
import Spring from 'devicon/icons/spring/spring-original.svg'
import Terraform from 'devicon/icons/terraform/terraform-original.svg'
import Vue from 'devicon/icons/vuejs/vuejs-original.svg'
import { type ReactElement } from 'react'

export type ServiceTemplateType = {
  title: string
  slug?: string
  description?: string
  icon?: string | ReactElement
  dockerFile?: string
  link?: string
}

export const serviceTemplates: ServiceTemplateType[] = [
  {
    slug: 'postgresql',
    title: 'PostgreSQL',
    description: 'PostgreSQL is a powerful, open-source object-relational database system.',
    icon: PostgreSQL,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-lambda-pulumi',
    title: 'Lambda Pulumi',
    description: 'AWS Lambda lets you run code without provisioning or managing servers.',
    icon: AWSLambda,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'redis',
    title: 'Redis',
    description: 'Redis is an open-source in-memory data structure store.',
    icon: Redis,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'terraform',
    title: 'Terraform',
    description: 'Terraform is an open-source infrastructure as code software tool.',
    icon: Terraform,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'react',
    title: 'React',
    description: 'React is a JavaScript library for building user interfaces.',
    icon: React,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'vue',
    title: 'Vue',
    description: 'Vue.js is a progressive framework for building user interfaces.',
    icon: Vue,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'angular',
    title: 'Angular',
    description:
      'Angular is a platform and framework for building single-page client applications using HTML and TypeScript.',
    icon: Angular,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nodejs',
    title: 'Node.js',
    description: 'Node.js is an open-source, cross-platform, back-end JavaScript runtime environment.',
    icon: Node,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-lambda-serverless',
    title: 'Lambda Serverless',
    description: 'AWS Lambda lets you run code without provisioning or managing servers.',
    icon: AWSLambda,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'mysql',
    title: 'MySQL',
    description: 'MySQL is an open-source relational database management system.',
    icon: MySQL,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'mongodb',
    title: 'MongoDB',
    description: 'MongoDB is a open-source document-oriented NoSQL database.',
    icon: MongoDB,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'kubecost',
    title: 'Kubecost',
    description: 'Kubecost is an open-source cost monitoring tool for Kubernetes.',
    icon: Helm,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'datadog',
    title: 'Datadog',
    description: 'Datadog is an observability platform for cloud-scale applications.',
    icon: Helm,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'spring',
    title: 'Spring',
    description: 'Spring is an open-source application framework for Java.',
    icon: Spring,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nextjs',
    title: 'NextJS',
    description: 'NextJS is a React framework with hybrid static & server rendering.',
    icon: NextJS,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
]
