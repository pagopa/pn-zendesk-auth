const { expect } = require("chai");
const sinon = require("sinon");
const utils = require("../app/utils");

const { handleEvent } = require("../app/eventHandler");

describe("Test zendeskAuthorizer eventHandler", () => {
	let originalGenerateToken;

	const helpCenterUrl = process.env.HELP_CENTER_URL;
	const productId = process.env.PRODUCT_ID;

	beforeEach(() => {
		originalGenerateToken = utils.generateToken;

		sinon.stub(utils, "isTrustedOrigin").returns(true);

		// Stub generateToken
		sinon
			.stub(utils, "generateToken")
			.callsFake((name, email, taxId, zendeskSecret) => {
				const forcedName = "Leonardo Da Vinci";
				const forcedTaxId = "DVNLRD52D15M059P";
				const forcedSecret = "fakeSecret";

				return originalGenerateToken(
					forcedName,
					email,
					forcedTaxId,
					forcedSecret
				);
			});
	});

	afterEach(() => {
		sinon.restore();
	});

	it("should include data in return_to when data is provided", async () => {
		const traceId = '1-67bf00c8-35bf5bec6440ab13382ad7ee';
		const event = {
			headers: {
				origin: "https://cittadini.dev.notifichedigitali.it",
				"Content-Type": "application/json",
				Authorization:
					"Bearer fakeBearer",
			},
			body: JSON.stringify({
				email: "test@email.com",
				traceId,
			}),
		};

		const response = await handleEvent(event);
		const body = JSON.parse(response.body);

		expect(response.statusCode).to.equal(200);
		expect(body.return_to).to.equal(
			`${helpCenterUrl}?product=${productId}&data=${traceId}`
		);
	});

	it("should not include data in return_to when data is not provided", async () => {
		const event = {
			headers: {
				origin: "https://cittadini.dev.notifichedigitali.it",
				"Content-Type": "application/json",
				Authorization: "Bearer fakeBearerToken",
			},
			body: JSON.stringify({
				email: "test@email.com",
			}),
		};

		const response = await handleEvent(event);
		const body = JSON.parse(response.body);

		expect(response.statusCode).to.equal(200);
		expect(body.return_to).to.equal(`${helpCenterUrl}?product=${productId}`);
	});
});
