import Algolia from 'devicon/icons/algolia/algolia-original.svg'
import AWSLambda from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Angular from 'devicon/icons/angularjs/angularjs-original.svg'
import MySQL from 'devicon/icons/mysql/mysql-original.svg'
import Node from 'devicon/icons/nodejs/nodejs-original.svg'
import PostgreSQL from 'devicon/icons/postgresql/postgresql-original.svg'
import React from 'devicon/icons/react/react-original.svg'
import Redis from 'devicon/icons/redis/redis-original.svg'
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
    slug: 'aws-lambda-pulimi',
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
    slug: 'algolia',
    title: 'Algolia',
    description: 'Algolia is a hosted search engine capable of delivering real-time results.',
    icon: Algolia,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
]
