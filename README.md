# E-commerce
Baseline product and order management system.

* Features Completed
    * [/] Product Management
        * [X] Product CRUD APIs
        * [X] React Page for View Products
        * [X] React Page for Saveing Products
        * [ ] React Page for Deleting Products
    * [/] Inventory Management
        * [X] Inventory Create, Update, & Read APIs
        * [ ] Inventory Delete API
        * [X] React Page for Viewing Product Inventory
        * [ ] React Page for Saving or Deleting Inventory
    * [ ] Order Maangement
        * [X] ERD in TDD
        * [ ] Order APIs
        * [ ] Order React Page
    * [ ] Shipping Maangement
        * [X] ERD in TDD
        * [ ] Shipping APIs
        * [ ] Shipping React Page

## Technical Design

[Technical Design Document](docs/TECHNICAL_DESIGN.md)

## Usage

Clone project with: `git clone https://github.com/ccthomas/ecommerce.git`

First some configuration notes. Due to time, some values are hardcoded.
1. Terraform SSM varaibles, containing Database Creds, are hardcoded. If you change the DB creds in the `.env` file, update the `./terraform/ssm.tf` file as well.

### Requirements
* Docker
    * For development, docker version 4.32.0 (157355) was used.

### Run Application

Docker containers must be run in a specfic order. Some services, like terraform, are one offs that are meant purely for configuring another service.

If needed, clean your docker environment `docker system prune -a --volumes`.
*note that the ports and containers are configurablee through the .env file. This has not been tested however.* 

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
    docker compose up -d service
    ```

1. Run React App

    ```bash
    docker compose up -d react-app
    ```

### Use Application

For React App, you can go to `http://localhost:3004`.

You can also hit the apis with basic curl commands, or open the provded Postman collection.
For a quick test to see if the service is working, try to create a new product.
```curl
curl --location 'http://0.0.0.0:3005/product' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Table"
}'
```