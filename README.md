# E-commerce
Baseline product and order management system.

## Technical Design

[Technical Design Document](docs/TECHNICAL_DESIGN.md)

## Usage

First some configuration notes. Due to time, some values are hardcoded.
1. Terraform SSM varaibles, containing Database Creds, are hardcoded. If you change the DB creds in the `.env` file, update the `./terraform/ssm.tf` file as well.
2. `ecommerce-service` utilities hardcode the Localstack container url. If changing the container name, you will need to update the hardcoded url.

### Requirements
* Docker
    * For development, docker version 4.33.0 (160616) was used.

### Run Application

Docker containers must be run in a specfic order. Some services, like terraform, are one offs that are menat purely for configuring another service.

1. Run Postgres Database

    ```bash
    docker compose up -d postgres-db
    ```

1. Run Localstack

    ```bash
    docker compose up -d localstack
    ```

1. Terraform Localstack

    ```bash
    docker compose up terraform
    ```

1. Run ECommerce Service

    ```bash
    docker compose up ecommerce-service
    ```

### Use Application

You can hit the apis with basic curl commands, or open the provded Postman collection.

For a quick test to see if the service is working, try to create a new product.

```curl
curl --location 'http://0.0.0.0:3005/product' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Table"
}'
```