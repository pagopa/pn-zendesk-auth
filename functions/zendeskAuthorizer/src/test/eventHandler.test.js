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
		const event = {
			headers: {
				origin: "https://cittadini.dev.notifichedigitali.it",
				"Content-Type": "application/json",
				Authorization:
					"Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFhZmQ0ZjllLTRhYmMtNDkwOC04NzMxLWJmNGVhOGI2ZTA4YSJ9.eyJpYXQiOjE3MTAzMjQyMzEsImV4cCI6MTcxMDMyNzQzMSwidWlkIjoiNDE0N2I1NDctODdiOS00YTIzLTk0MjAtY2FjNTc3NTViMjZjIiwiaXNzIjoiaHR0cHM6Ly93ZWJhcGkuZGV2Lm5vdGlmaWNoZWRpZ2l0YWxpLml0IiwiYXVkIjoid2ViYXBpLmRldi5ub3RpZmljaGVkaWdpdGFsaS5pdCIsImp0aSI6Il9lMGQ4N2RkZWE3MDNhMjFmYzQ0NiJ9.dfgkCcagjdnNAakmjbB-YhgGuSd_DpFLd3s8HdWTtefA6pP8BT9BopYLJzBIduxwddQ2A0ac_n6gSTmSXQQg6FUbOtKL-AuCiHfQqXw6OYYw6jhJty86z5JlGuiulOVmUxqTsLYFI5AyFnac7fe_RiuMYZzeWfclUFBEPmYsGrQ-xvR7rlNO5nMYj9bL-2_91RofkBse3-1ITBBA5B9wTTO3sjRQHAEdCcih3Vl9eLatdSpR2VuOPuGBjw31BgiCcTScdtbfMkwdfhlEJdnKTdSrJsQp6hg3C4aPrcqDveOcqJjzo1R3JsIrhL_X5w8SBFasWsmQepMQFmZm2HNp1A",
			},
			body: JSON.stringify({
				email: "test@email.com",
				data: "test-data",
			}),
		};

		const response = await handleEvent(event);
		const body = JSON.parse(response.body);

		expect(response.statusCode).to.equal(200);
		expect(body.return_to).to.equal(
			`${helpCenterUrl}?product=${productId}&data=test-data`
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
