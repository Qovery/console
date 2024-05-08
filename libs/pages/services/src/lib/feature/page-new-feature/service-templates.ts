import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Angular from 'devicon/icons/angularjs/angularjs-original.svg'
import Cloudflare from 'devicon/icons/cloudflare/cloudflare-original.svg'
import Couchbase from 'devicon/icons/couchbase/couchbase-original.svg'
import FastAPI from 'devicon/icons/fastapi/fastapi-original.svg'
import Flask from 'devicon/icons/flask/flask-original.svg'
import Golang from 'devicon/icons/go/go-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Helm from 'devicon/icons/helm/helm-original.svg'
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
    slug: 'aws-lambda',
    title: 'AWS Lambda',
    description: 'AWS Lambda lets you run code without provisioning or managing servers.',
    icon: AWS,
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
  {
    slug: 'couchbase',
    title: 'Couchbase',
    description: 'Couchbase is an open-source, distributed, NoSQL document-oriented database.',
    icon: Couchbase,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'rust',
    title: 'Rust',
    description: 'Rust is a multi-paradigm system programming language focused on safety and performance.',
    icon: Rust,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'golang',
    title: 'Go',
    description:
      'Go is an open-source programming language that makes it easy to build simple, reliable, and efficient software.',
    icon: Golang,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nginx',
    title: 'NGINX',
    description:
      'NGINX is a web server that can also be used as a reverse proxy, load balancer, mail proxy, and HTTP cache.',
    icon: Nginx,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'caddy',
    title: 'Caddy',
    description: 'Caddy is a powerful, enterprise-ready, open source web server with automatic HTTPS written in Go.',
    icon: Golang,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'rails',
    title: 'Rails',
    description: 'Rails is a web application framework written in Ruby.',
    icon: Rails,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'ruby',
    title: 'Ruby',
    description: 'Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.',
    icon: Ruby,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'nestjs',
    title: 'NestJS',
    description:
      'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
    icon: NestJS,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'python',
    title: 'Python',
    description: 'Python is a programming language that lets you work quickly and integrate systems more effectively.',
    icon: Python,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'flask',
    title: 'Flask',
    description: 'Flask is a lightweight WSGI web application framework.',
    icon: Flask,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'fastapi',
    title: 'FastAPI',
    description: 'FastAPI is a modern, fast , web framework for building APIs based on standard Python type hints.',
    icon: FastAPI,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'replibyte',
    title: 'Replibyte',
    description:
      'Replibyte is a tool written in Rust by the Qovery team to seed databases with production data without sensitive data.',
    icon: Rust,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'cloudflare-worker',
    title: 'Cloudflare Worker',
    description:
      'Cloudflare Worker is a serverless platform that enables you to write and deploy code on Cloudflare’s edge.',
    icon: Cloudflare,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'java',
    title: 'Java',
    description: 'Java is a high-level, class-based, object-oriented programming language.',
    icon: Java,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-assume-roles',
    title: 'AWS Assume Roles',
    description: 'AWS Assume Roles is a tool to assume roles for your services on your Kubernetes cluster.',
    icon: AWS,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'aws-s3',
    title: 'AWS S3',
    description:
      'AWS S3 is an object storage service that offers industry-leading scalability, data availability, security, and performance.',
    icon: AWS,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'gcp-bigquery',
    title: 'GCP BigQuery',
    description:
      'GCP BigQuery is a serverless, highly scalable, and cost-effective multi-cloud data warehouse designed for business agility.',
    icon: GCP,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'windmill',
    title: 'Windmill',
    description: 'Windmill is an open-source workflow orchestration engine written in Rust.',
    icon: Rust,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'temporal',
    title: 'Temporal',
    description: 'Temporal is an open-source, stateful, and scalable workflow orchestration engine.',
    icon: Java,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
  {
    slug: 'crossplane',
    title: 'Crossplane',
    description:
      'Crossplane is an open-source Kubernetes add-on that extends your cluster with the ability to provision services and infrastructure.',
    icon: Helm,
    dockerFile:
      'https://raw.githubusercontent.com/Qovery/lifecycle-job-examples/main/examples/aws-lambda-with-serverless/Dockerfile',
  },
]
