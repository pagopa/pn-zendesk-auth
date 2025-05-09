const utils = require("./utils");

function getCommonHeaders(allowedOrigin) {
	return {
		"Access-Control-Allow-Origin": allowedOrigin,
		"Access-Control-Allow-Headers": "Content-Type,Authorization",
		"Access-Control-Allow-Methods": "POST",
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
	};
}

function createResponse(
	statusCode,
	allowedOrigin,
	body = "",
	additionalHeaders = {}
) {
	return {
		statusCode,
		headers: {
			...getCommonHeaders(allowedOrigin),
			...additionalHeaders,
		},
		body: typeof body === "string" ? body : JSON.stringify(body),
	};
}

exports.handleEvent = async (event) => {
	const allowedOrigin = event.headers.origin;

	// Verifica origine trusted
	if (!utils.isTrustedOrigin(allowedOrigin, process.env.CORS_ALLOWED_DOMAINS)) {
		const message = "Untrusted origin " + allowedOrigin;
		console.info("Event: ", utils.removeSensibleInfoFromEvent(event));
		return createResponse(
			403,
			allowedOrigin,
			utils.generateProblem(403, message)
		);
	}

	// Gestione OPTIONS
	if (event.httpMethod === "OPTIONS") {
		return createResponse(200, allowedOrigin, "");
	}

	// Recupero secrets
	let zendeskSecret, pdvSecret;

	try {
		if (process.env.ZENDESK_SECRET_ARN) {
			const secret = await utils.getSecretFromManager(
				process.env.ZENDESK_SECRET_ARN
			);
			zendeskSecret = secret["sso_secret"];
		}

		if (process.env.PDV_SECRET_ARN) {
			const secret = await utils.getSecretFromManager(
				process.env.PDV_SECRET_ARN
			);
			pdvSecret = secret["UserRegistryApiKeyForPF"];
		}
	} catch (ex) {
		return createResponse(
			500,
			allowedOrigin,
			utils.generateProblem(500, ex.message)
		);
	}

	// Decodifica token
	let decodedToken;
	try {
		const encodedToken = event.headers.Authorization.replace("Bearer ", "");
		decodedToken = utils.decodeToken(encodedToken);
	} catch (err) {
		return createResponse(
			500,
			allowedOrigin,
			utils.generateProblem(500, err.message)
		);
	}

	// Recupero informazioni utente
	let userId, userEmail, data;
	try {
		userId = decodedToken?.payload.uid;
		const requestBody = JSON.parse(event?.body);
		userEmail = requestBody?.email;
		data = requestBody?.data;
	} catch (err) {
		console.error("Unable to get user information input", err);
		return createResponse(
			500,
			allowedOrigin,
			utils.generateProblem(500, err.message)
		);
	}

	// Recupero informazioni da PDV
	let userName, userTaxId;
	if (process.env.PDV_USER_REGISTRY_URL) {
		const fieldsToRetrieve = ["name", "familyName", "fiscalCode"];
		try {
			const userResource = await utils.getUserById(
				process.env.PDV_USER_REGISTRY_URL,
				pdvSecret,
				userId,
				fieldsToRetrieve
			);
			userName = userResource.name.value + " " + userResource.familyName.value;
			userTaxId = userResource.fiscalCode;
		} catch (err) {
			return createResponse(
				500,
				allowedOrigin,
				utils.generateProblem(500, err.message)
			);
		}
	}

	// Generazione JWT per Zendesk
	let jwtZendesk;
	try {
		jwtZendesk = utils.generateToken(
			userName,
			userEmail,
			userTaxId,
			zendeskSecret
		);
	} catch (err) {
		return createResponse(
			500,
			allowedOrigin,
			utils.generateProblem(500, err.message)
		);
	}

	// Preparazione risposta finale
	const helpCenterUrl = process.env.HELP_CENTER_URL;
	const productId = process.env.PRODUCT_ID;
	const dataQueryStr = data ? `&data=${data}` : "";
	const returnBody = {
		action_url: process.env.ACTION_URL,
		jwt: jwtZendesk,
		return_to: `${helpCenterUrl}?product=${productId}${dataQueryStr}`,
	};

	return createResponse(200, allowedOrigin, returnBody);
};
