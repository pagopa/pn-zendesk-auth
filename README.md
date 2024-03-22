# pn-zendesk-auth
Integrazione portale cittadini SeND per una nuova richiesta di supporto Zendesk.
L'implementazione é stata realizzata tramite:
- AWS API Gateway
- AWS Lambda
- AWS Secrets Manager

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisiti

Installazione dell'ultima versione di NPM.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installazione

1. Clone del repository
   ```sh
   git clone https://github.com/pagopa/pn-zendesk-auth.git
   ```
2. Installazione pacchetti NPM
   ```sh
   npm install
   ```
3. Esecuzione test unitari
   ```sh
   npm run-script test
   ```
4. Build della lambda
   ```sh
   npm run-script build
   ```
## Utilizzo

   ```sh
   curl --location 'https://webapi.dev.notifichedigitali.it/zendesk-authorization/new-support-request' \
    --header 'origin: https://cittadini.dev.notifichedigitali.it' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer eyJhbGciOiAiUlMyNTYiLCJ0eXAiOiAiSldUIiwia2lkIjogImFhZmQ0ZjllLTRhYmMtNDkwOC04NzMxLWJmNGVhOGI2ZTA4YSJ9.eyJpYXQiOiAxNzExMDMyMTA2LCJleHAiOiAxNzQyNTY4MTA2LCAidWlkIjogIjQxNDdiNTQ3LTg3YjktNGEyMy05NDIwLWNhYzU3NzU1YjI2YyIsImlzcyI6ICJodHRwczovL3dlYmFwaS5kZXYubm90aWZpY2hlZGlnaXRhbGkuaXQiLCJhdWQiOiAid2ViYXBpLmRldi5ub3RpZmljaGVkaWdpdGFsaS5pdCJ9.vNrejGDnEgUDN3vCmQuCDK_l7W7KXYhL7xMOKXpDjK5-1VMbPDb2tOlZgX9t2skejYR2LjUwl_uMqZOuFmXDlwPLZF-sQoVjHHR_tUYWULmG9aJcbXmC1esbKmk9-UdQcEaYLg2BHLGWWxf8VoOHwTeMGp2BP3ElhjMcNGB6O0N5h-3ep4FQVDwERKur7EplZ7-XraytL0px628jM_PgEH-S8ZMfcqKBqF5txG8v1YNLCAGAMOdlr6RVPE9GwVPMDCVpDyVr-DgE1QxdpiKgn5FBOgjClOPsb3wF3bIVLgOenrzqqud3c-9HvfMUUUm1Aa9-hr0v4nvJ8s5k6Fwoxw' \
    --data-raw '{
        "email": "leonardo.davinci@fakemail.it"
    }'
   ```

## Parametrizzazione Lambda

### Gestione secrets
_ZENDESK_SECRET_ARN_: arn da utilizzare per il recupero del secret zendesk

_PDV_SECRET_ARN_: arn da utilizzare per il recupero del secret per contattare user registry di Personal Data Vault

_PDV_USER_REGISTRY_URL_: base url dello user registry di Personal Data Vault

### Gestione CORS
_CORS_ALLOWED_DOMAINS_: la lista dei domini abilitati a richiedere assistenza

### Assistenza prodotto
_HELP_CENTER_URL_: url dell'help center per gestire nuova richiesta di assistenza

_PRODUCT_ID_: identificativo del prodotto per il quale si sta richiedendo assistenza

_ACTION_URL_: url Zendesk dove inviare nuova richiesta di assistenza