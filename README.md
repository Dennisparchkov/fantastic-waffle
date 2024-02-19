# Freeshares

## Pre-requisites

* Docker & docker-compose
* Node 20
* yarn

## Installation

1. Clone the repository
2. Run `yarn install`
3. Run `yarn locally` this will spin up the environment locally in docker


## Assumptions

* Authz and Authn are out of scope for this project, we pass in the requested userID in the request body. This would use a JWT in production.
* The Broker will handle queuing the order if the market is closed. This will be represented by the status field in the order object.
* The Broker implements an idempotent API, so if the same order is sent twice, the second request will be ignored and would return the same order ID.
