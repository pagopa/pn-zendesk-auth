const utils = require("./utils");

exports.handleEvent = async (event) => {
    var allowedOrigin = event.headers.origin;
    if (!utils.isTrustedOrigin(allowedOrigin, process.env.CORS_ALLOWED_DOMAINS)) {
        let message = "Untrusted origin " + allowedOrigin;
        return {
            statusCode: 403,
            body: JSON.stringify(utils.generateProblem(403, message))
        };
    }

    // gestione OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        // CORS headers
        const headers = {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        };

        // Return a response for the preflight request
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }

    // recupero dei secrets
    if (process.env.ZENDESK_SECRET_ARN) {
        var zendeskSecret;
        try {
            zendeskSecret = await utils.getSecretFromManager(process.env.ZENDESK_SECRET_ARN);
            zendeskSecret = zendeskSecret['sso_secret'];
        } catch(ex) {
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": allowedOrigin,
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST"
                },
                body: JSON.stringify(utils.generateProblem(500, ex.message))
            }
        }
    }

    if (process.env.PDV_SECRET_ARN) {
        var pdvSecret;
        try {
            pdvSecret = await utils.getSecretFromManager(process.env.PDV_SECRET_ARN);
            pdvSecret = pdvSecret['UserRegistryApiKeyForPF']
        } catch(ex) {
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": allowedOrigin,
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST"
                },
                body: JSON.stringify(utils.generateProblem(500, ex.message))
            }
        }
    }

    // recupero informazioni dal jwt
    const encodedToken = event.headers.Authorization.replace("Bearer ", "");
    var decodedToken;
    try { 
        decodedToken = utils.decodeToken(encodedToken);
    } catch(err) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST"
            },
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
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST"
            },
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
            userName = userResource.name.value + ' ' + userResource.familyName.value;
            userTaxId = userResource.fiscalCode;
        } catch(err) {
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": allowedOrigin,
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST"
                },
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
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST"
            },
            body: JSON.stringify(utils.generateProblem(500, err.message))
        }
    }

    const help_center_url = process.env.HELP_CENTER_URL
    const product_id = process.env.PRODUCT_ID
    const action_url = process.env.ACTION_URL

    const return_to = help_center_url + "?product=" + product_id
    
    const returnBody = {
        action_url: action_url,
        jwt: jwtZendesk,
        return_to: return_to
    }
    
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST"
        },
        body: JSON.stringify(returnBody)
    }
    
}