# Freeshares

## Pre-requisites

* Docker & docker-compose (running locally)
* psql (inserting test data)
* yarn (installing dependencies)

## Installation

1. Clone the repository
2. Run `yarn install` to install the dependencies
4. `yarn insert-test-data` to insert test data into the database
3. Run `yarn locally` this will spin up the environment locally in docker

Some things to improve On:
* Linting is not setup correctly, there are some basic lint rules but these can be fined tuned to catch and auto fix issues
* Write e2e tests to test in docker
* Setup a logger like pino for production.

## Organisation

* `apps/api` - The main API for the freeshares service (Fastify)
* `apps/faker-broker` - A fake broker that simulates a broker that can handle buy and sell orders for a stock. It is a simple REST API that can be used to simulate a broker. Used in e2e tests and when run locally
* `libs` - Contains the shared libraries for the apps
  * `libs/allocation` - Contains the allocation logic for the freeshares service 
  * `libs/broker` - Contains the broker client for the freeshares service 
  * `libs/distributed-lock` - Contains the distributed lock implemenration using redis used in the api 
  * `libs/instrument` - Contains logic of chosing a random instrument within a given price range for freeshares 
  * `libs/user` - Contains the user repo.

We use TypeORM for our repository classes and database interaction.
NX is used as a repo manager, this allows us to easily manage the monorepo and run commands across the different apps and libs. 
Run `yarn nx graph` to see the dependency graph of the repo as a glance and what libs/apps are affected by changes.

## Assumptions

* We are using typeORM to manage the database schema and migrations with auto sync. Once the API starts up, it will apply any migrations and create the schema if it does not exist. This is quite dangerous in a production environment, but for the purposes of this project, it is fine.
* Authz and Authn are out of scope for this project, we pass in the requested userID in the request body. This would use a JWT in production.
* The Broker will handle queuing the order if the market is closed. This will be represented by the status field in the order object.
* The Broker implements an idempotent API, so if the same order is sent twice, the second request will be ignored and would return the same order ID. We will use the userId as the idempotency key as we have the condition that a user can only have 1 freeshare.
* We use mockingJay to mock the broker in docker (using docker dns)
* Redis is used to maintain distributed locks so we make sure each client can only be in the process of claiming a 1 freeshare at a time. 
* We fetch the live prices and availale instruments from the broker for each freeshare redemption, but this can be cached locally (redis or postgres) for improved performance.

### CPA Allocation 

Cost Per Aquisition (CPA) allocation is controler via the `FREESHARE_USE_CPA` env var.
The algorithm is as follows, For each freeshare trying to be redeemed:
* Find the existing CPA by getting the cost of all existing claimed freeshares, divided by the total amount.
* If this is above the target CPA, then give a random freeshare between the target CPA and max price per share.
* If this is below the target CPA, then give a random freeshare between the min price per share and the target CPA.
Over the course of many redemptions, the CPA will converge to the target CPA.

The basic allocation work as follows, when redeeming a freeshare:
* Pick a random number between 0 and 1
* If the number is less or equal to 0.95, give the £3 - £10 freeshare (95%)
* If the number is less or equal to 0.98, give the £10 - £25 freeshare (3%)
* else give the £25 - £200 freeshare (2%)

The allocation is split from the redemption to allow for easier testing and changing of the allocation algorithm.

## Testing
### Unit Tests
Run `yarn test` to run the unit tests
### E2E Tests
Run `yarn locally` to spin up the environment locally in docker, e2e tests can be added in the `api-e2e` app to use the mocks and test the system end to end.
