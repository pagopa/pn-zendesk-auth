# pn-zendesk-auth
Integrazione portale cittadini SeND per una nuova richiesta di supporto Zendesk.
L'implementazione é stata realizzata tramite:
- AWS API Gateway
- AWS Lambda
- AWS Secrets Manager

## Getting Started

Recuperare una copia locale ed eseguire build e test.

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
    --header 'Authorization: Bearer <JWT>' \
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

## Configurazione infrastruttura

### Lambda
_ZendeskAuthLambdaReservedConcurrency_: numero di istanze lambda concorrenti riservate

### API Gateway
_WebWafLimit_: limite di richieste per singolo IP in 5 minuti