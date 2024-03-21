# pn-zendesk-auth
Integrazione portale cittadini SeND per una nuova richiesta di supporto Zendesk.
L'implementazione é stata realizzata tramite:
- AWS API Gateway
- AWS Lambda
- AWS Secrets Manager

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