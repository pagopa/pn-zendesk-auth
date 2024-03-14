const utils = require("./utils");

async function handleEvent(event) {
    // recupero dei secrets
    if (process.env.ZENDESK_SECRET_NAME) {
        var zendeskSecret;
        try {
            zendeskSecret = utils.getSecretFromManager(process.env.ZENDESK_SECRET_NAME);
        } catch(ex) {
            return {
                statusCode: 500,
                body: JSON.stringify(utils.generateProblem(500, ex.message))
            }
        }
    }

    if (process.env.PDV_SECRET_NAME) {
        var pdvSecret;
        try {
            pdvSecret = utils.getSecretFromManager(process.env.PDV_SECRET_NAME);
        } catch(ex) {
            return {
                statusCode: 500,
                body: JSON.stringify(utils.generateProblem(500, ex.message))
            }
        }
    }

    // recupero informazioni dal jwt
    const encodedToken = event?.authorizationToken?.replace("Bearer ", "");
    var decodedToken;
    try { 
        decodedToken = utils.decodeToken(encodedToken);
    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify(utils.generateProblem(500, err.message))
        }
    }
    

    // recupero informazioni utente da input
    var userId;
    var userEmail;
    try {
        userId = decodedToken?.payload.uid;
        let requestBody = JSON.parse(event?.body);
        userEmail = requestBody?.email;
    } catch(err) {
        console.error("Unable to get user information input", err);
        return {
            statusCode: 500,
            body: JSON.stringify(utils.generateProblem(500, err.message))
        }
    }
    

    // deanonimizzazione tramite chiamata a PDV https://api.uat.pdv.pagopa.it/user-registry/v1
    if(process.env.PDV_USER_REGISTRY_URL) {
        let fieldsToRetrieve = ['name', 'familyName', 'fiscalCode'];
        var userName;
        var userTaxId;
        try {
            let userResource = await utils.getUserById(process.env.PDV_USER_REGISTRY_URL, pdvSecret, userId ,fieldsToRetrieve);
            userName = userResource.name + ' ' + userResource.familyName;
            userTaxId = userResource.fiscalCode;
        } catch(err) {
            return {
                statusCode: 500,
                body: JSON.stringify(utils.generateProblem(500, err.message))
            }
        }
        
    }

    // generazione jwt zendesk
    var jwtZendesk;
    try {
        jwtZendesk = utils.generateToken(userName, userEmail, userTaxId, zendeskSecret);
    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify(utils.generateProblem(500, err.message))
        }
    }

    try{
        // produzione html
        const help_center_url = "https://send.assistenza.pagopa.it/hc/it/requests/new"
        const product_id = "prod-pn-pf"
        const return_to = help_center_url + "?product=" + product_id
        const action_url = "https://pagopa.zendesk.com/access/jwt"

        const formHTML = utils.generateJWTForm(action_url, jwtZendesk, return_to);
        console.log(formHTML);
        return {
            statusCode: 200,
            body: formHTML
        }
    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify(utils.generateProblem(500, err.message))
        }
    }
    
}