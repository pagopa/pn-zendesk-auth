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

    // Helper function to create test events
    const createTestEvent = (email, data = null) => ({
        headers: {
            origin: "https://cittadini.dev.notifichedigitali.it",
            "Content-Type": "application/json",
            Authorization: "Bearer fakeBearer",
        },
        body: JSON.stringify({
            email,
            ...(data && { data })
        }),
    });

    const testDataScenarios = [
        {
            description: "should include data in return_to when data is provided - both traceId and errorCode",
            data: {
                traceId: '1-67bf00c8-35bf5bec6440ab13382ad7ee',
                errorCode: 'PN_USERATTRIBUTES_RETRYLIMITVERIFICATIONCODE'
            }
        },
        {
            description: "should include data in return_to when data is provided - traceId only",
            data: {
                traceId: '1-67bf00c8-35bf5bec6440ab13382ad7ee'
            }
        },
        {
            description: "should not include data in return_to when data is not provided",
            data: null
        }
    ];

    testDataScenarios.forEach(({ description, data }) => {
        it(description, async () => {
            const event = createTestEvent("test@email.com", data);
            const response = await handleEvent(event);
            const body = JSON.parse(response.body);
            
            expect(response.statusCode).to.equal(200);
            
            const expectedReturnTo = data 
                ? `${helpCenterUrl}?product=${productId}&data=${encodeURIComponent(JSON.stringify(data))}`
                : `${helpCenterUrl}?product=${productId}`;
                
            expect(body.return_to).to.equal(expectedReturnTo);
        });
    });
});