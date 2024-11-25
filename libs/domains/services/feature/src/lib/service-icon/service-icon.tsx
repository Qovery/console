import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Angular from 'devicon/icons/angularjs/angularjs-original.svg'
import Apache from 'devicon/icons/apache/apache-original.svg'
import ApacheAirflow from 'devicon/icons/apacheairflow/apacheairflow-original.svg'
import ApacheKafka from 'devicon/icons/apachekafka/apachekafka-original.svg'
import Azure from 'devicon/icons/azure/azure-original.svg'
import Bash from 'devicon/icons/bash/bash-original.svg'
import Cloudflare from 'devicon/icons/cloudflare/cloudflare-original.svg'
import Couchbase from 'devicon/icons/couchbase/couchbase-original.svg'
import Docker from 'devicon/icons/docker/docker-original.svg'
import Elasticsearch from 'devicon/icons/elasticsearch/elasticsearch-original.svg'
import FastAPI from 'devicon/icons/fastapi/fastapi-original.svg'
import Flask from 'devicon/icons/flask/flask-original.svg'
import Golang from 'devicon/icons/go/go-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Grafana from 'devicon/icons/grafana/grafana-original.svg'
import Java from 'devicon/icons/java/java-original.svg'
import Kotlin from 'devicon/icons/kotlin/kotlin-original.svg'
import Kubernetes from 'devicon/icons/kubernetes/kubernetes-original.svg'
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
import Svelte from 'devicon/icons/svelte/svelte-original.svg'
import Terraform from 'devicon/icons/terraform/terraform-original.svg'
import Vue from 'devicon/icons/vuejs/vuejs-original.svg'

const Qovery = '/assets/logos/logo-icon.svg'
const Datadog = '/assets/devicon/datadog.svg'
const Crossplane = '/assets/devicon/crossplane.svg'
const Kubecost = '/assets/devicon/kubecost.svg'
const Windmill = '/assets/devicon/windmill.svg'
const Temporal = '/assets/devicon/temporal.svg'
const CloudFormation = '/assets/devicon/cloudformation.svg'
const Scaleway = '/assets/devicon/scaleway.svg'
const Clickhouse = '/assets/devicon/clickhouse.svg'
const Airbyte = '/assets/devicon/airbyte.svg'
const EC2 = '/assets/devicon/ec2.svg'
const Lambda = '/assets/devicon/lambda.svg'
const S3 = '/assets/devicon/s3.svg'

export const ServiceIcons = {
  'app://qovery-console/lifecycle-job': { icon: '/assets/services/lifecycle-job.svg', title: 'LifecycleJob' },
  'app://qovery-console/cron-job': { icon: '/assets/services/cron-job.svg', title: 'CronJob' },
  'app://qovery-console/container': { icon: '/assets/services/application.svg', title: 'Container' },
  'app://qovery-console/database': { icon: '/assets/services/database.svg', title: 'Database' },
  'app://qovery-console/helm': { icon: '/assets/services/helm.svg', title: 'Helm' },
  'app://qovery-console/application': {
    icon: '/assets/services/application.svg',
    title: 'Application',
  },

  // Devicons
  'app://qovery-console/apache': { icon: Apache, title: 'Apache' },
  'app://qovery-console/apacheairflow': { icon: ApacheAirflow, title: 'Apache Airflow' },
  'app://qovery-console/apachekafka': { icon: ApacheKafka, title: 'Apache Kafka' },
  'app://qovery-console/angular': { icon: Angular, title: 'Angular' },
  'app://qovery-console/aws': { icon: AWS, title: 'AWS' },
  'app://qovery-console/azure': { icon: Azure, title: 'Azure' },
  'app://qovery-console/bash': { icon: Bash, title: 'Bash' },
  'app://qovery-console/cloudflare': { icon: Cloudflare, title: 'Cloudflare' },
  'app://qovery-console/couchbase': { icon: Couchbase, title: 'Couchbase' },
  'app://qovery-console/docker': { icon: Docker, title: 'Docker' },
  'app://qovery-console/elasticsearch': { icon: Elasticsearch, title: 'Elasticsearch' },
  'app://qovery-console/fastapi': { icon: FastAPI, title: 'FastAPI' },
  'app://qovery-console/flask': { icon: Flask, title: 'Flask' },
  'app://qovery-console/gcp': { icon: GCP, title: 'GCP' },
  'app://qovery-console/golang': { icon: Golang, title: 'Golang' },
  'app://qovery-console/grafana': { icon: Grafana, title: 'Grafana' },
  'app://qovery-console/java': { icon: Java, title: 'Java' },
  'app://qovery-console/kotlin': { icon: Kotlin, title: 'Kotlin' },
  'app://qovery-console/kubernetes': { icon: Kubernetes, title: 'Kubernetes' },
  'app://qovery-console/mongodb': { icon: MongoDB, title: 'MongoDB' },
  'app://qovery-console/mysql': { icon: MySQL, title: 'MySQL' },
  'app://qovery-console/nestjs': { icon: NestJS, title: 'NestJS' },
  'app://qovery-console/nextjs': { icon: NextJS, title: 'NextJS' },
  'app://qovery-console/nginx': { icon: Nginx, title: 'Nginx' },
  'app://qovery-console/node': { icon: Node, title: 'Node' },
  'app://qovery-console/nuxtjs': { icon: NuxtJS, title: 'NuxtJS' },
  'app://qovery-console/postgresql': { icon: PostgreSQL, title: 'PostgreSQL' },
  'app://qovery-console/prometheus': { icon: Prometheus, title: 'Prometheus' },
  'app://qovery-console/pulumi': { icon: Pulumi, title: 'Pulumi' },
  'app://qovery-console/python': { icon: Python, title: 'Python' },
  'app://qovery-console/rabbitmq': { icon: RabbitMQ, title: 'RabbitMQ' },
  'app://qovery-console/rails': { icon: Rails, title: 'Rails' },
  'app://qovery-console/react': { icon: React, title: 'React' },
  'app://qovery-console/redis': { icon: Redis, title: 'Redis' },
  'app://qovery-console/ruby': { icon: Ruby, title: 'Ruby' },
  'app://qovery-console/rust': { icon: Rust, title: 'Rust' },
  'app://qovery-console/spring': { icon: Spring, title: 'Spring' },
  'app://qovery-console/svelte': { icon: Svelte, title: 'Svelte' },
  'app://qovery-console/terraform': { icon: Terraform, title: 'Terraform' },
  'app://qovery-console/vue': { icon: Vue, title: 'Vue' },

  // Others
  'app://qovery-console/airbyte': { icon: Airbyte, title: 'Airbyte' },
  'app://qovery-console/clickhouse': { icon: Clickhouse, title: 'Clickhouse' },
  'app://qovery-console/cloudformation': { icon: CloudFormation, title: 'CloudFormation' },
  'app://qovery-console/crossplane': { icon: Crossplane, title: 'Crossplane' },
  'app://qovery-console/datadog': { icon: Datadog, title: 'Datadog' },
  'app://qovery-console/ec2': { icon: EC2, title: 'EC2' },
  'app://qovery-console/kubecost': { icon: Kubecost, title: 'Kubecost' },
  'app://qovery-console/qovery': { icon: Qovery, title: 'Qovery' },
  'app://qovery-console/scaleway': { icon: Scaleway, title: 'Scaleway' },
  'app://qovery-console/temporal': { icon: Temporal, title: 'Temporal' },
  'app://qovery-console/windmill': { icon: Windmill, title: 'Windmill' },
  'app://qovery-console/lambda': { icon: Lambda, title: 'Lambda' },
  'app://qovery-console/s3': { icon: S3, title: 'S3' },
} as const

export type IconURI = keyof typeof ServiceIcons
