const utils = require("./utils");

async function handleEvent(event) {
    // recupero dei secrets
    if (process.env.ZENDESK_SECRET_NAME) {
        try {
           const zendeskSecret = utils.getSecretFromManager(process.env.ZENDESK_SECRET_NAME);
        } catch(ex) {
            console.log(ex);
        }
    }

    if (process.env.PDV_SECRET_NAME) {
        try {
           const pdvSecret = utils.getSecretFromManager(process.env.PDV_SECRET_NAME);
        } catch(ex) {
            console.log(ex);
        }
    }

    // recupero informazioni dal jwt

    // deanonimizzazione tramite chiamata a PDV

    // generazione jwt zendesk

    // produzione html
}