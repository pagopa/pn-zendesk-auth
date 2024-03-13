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
    const encodedToken = event?.authorizationToken?.replace("Bearer ", "");
    const decodedToken = utils.decodeToken(encodedToken);

    // recupero uid dal decodedToken

    const requestBody = JSON.parse(event?.body);
    const userEmail = requestBody?.email;

    // deanonimizzazione tramite chiamata a PDV

    // generazione jwt zendesk
    const jwtZendesk = utils.generateToken(userName, userEmail, userTaxId, zendeskSecret);

    // produzione html
    const help_center_url = "https://send.assistenza.pagopa.it/hc/it/requests/new"
    const product_id = "prod-pn-pf"
    const return_to = help_center_url + urllib.parse.quote("?product=" + product_id)
    const action_url = "https://pagopa.zendesk.com/access/jwt"

    const formHTML = generateJWTForm(action_url, jwtZendesk, return_to);
    console.log(formHTML);
}