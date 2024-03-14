const { decodeToken, generateToken, generateJWTForm, getSecretFromManager, getUserById } = require("../app/utils");
const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");
const axios = require('axios');

var MockAdapter = require("axios-mock-adapter");
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("decode token test", function() {
    let mock;

    before(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    after(() => {
        mock.restore();
    });


    it("should return decoded token", async () => {
        const decodedToken = decodeToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFhZmQ0ZjllLTRhYmMtNDkwOC04NzMxLWJmNGVhOGI2ZTA4YSJ9.eyJpYXQiOjE3MTAzMjQyMzEsImV4cCI6MTcxMDMyNzQzMSwidWlkIjoiNDE0N2I1NDctODdiOS00YTIzLTk0MjAtY2FjNTc3NTViMjZjIiwiaXNzIjoiaHR0cHM6Ly93ZWJhcGkuZGV2Lm5vdGlmaWNoZWRpZ2l0YWxpLml0IiwiYXVkIjoid2ViYXBpLmRldi5ub3RpZmljaGVkaWdpdGFsaS5pdCIsImp0aSI6Il9lMGQ4N2RkZWE3MDNhMjFmYzQ0NiJ9.dfgkCcagjdnNAakmjbB-YhgGuSd_DpFLd3s8HdWTtefA6pP8BT9BopYLJzBIduxwddQ2A0ac_n6gSTmSXQQg6FUbOtKL-AuCiHfQqXw6OYYw6jhJty86z5JlGuiulOVmUxqTsLYFI5AyFnac7fe_RiuMYZzeWfclUFBEPmYsGrQ-xvR7rlNO5nMYj9bL-2_91RofkBse3-1ITBBA5B9wTTO3sjRQHAEdCcih3Vl9eLatdSpR2VuOPuGBjw31BgiCcTScdtbfMkwdfhlEJdnKTdSrJsQp6hg3C4aPrcqDveOcqJjzo1R3JsIrhL_X5w8SBFasWsmQepMQFmZm2HNp1A")
        console.log("decodedToken: ", decodedToken);
        expect(decodeToken).to.not.be.null;
        expect(decodeToken).to.not.be.undefined;

    });

    it("should return jwt token - success", async () => {
        const jwtToken = generateToken("Leonardo Da Vinci", "leonardo.davinci@fakemail.it", "DVNLRD52D15M059P", "fakeSecret")
        console.log("jwtToken: ", jwtToken);
        expect(jwtToken).to.not.be.null;
        expect(jwtToken).to.not.be.undefined;
    });

    it("should return jwt token - fail", async () => {
        expect(() => {
            generateToken("Leonardo Da Vinci", "leonardo.davinci@fakemail.it", "DVNLRD52D15M059P", null);
        }).to.throw('Unable to generate token');
    });

    it("should return html form - success", async () => {
        const action_url = "https://pagopa.zendesk.com/access/jwt"
        const help_center_url = "https://send.assistenza.pagopa.it/hc/it/requests/new"
        const jwt_string = "fakejwtstring"
        const product_id = "prod-pn-pf"
        const return_to = help_center_url + "?product=" + product_id
        const htmlForm = generateJWTForm(action_url, jwt_string, return_to);
        console.log("htmlForm: ", htmlForm);
        expect(htmlForm).to.not.be.null;
        expect(htmlForm).to.not.be.undefined;
    });

    it("should get secret from manager - success", async () => {
        const secretName = "secretName";
        const url = `http://localhost:2773/secretsmanager/get?secretId=${encodeURIComponent(secretName)}`;
        mock.onGet(url).reply(200, JSON.stringify({ SecretString: "secretValue" }), {"Content-Type": "application/json"})
        const secret = await getSecretFromManager(secretName);
        console.log("secretValue: ", secret);
        expect(secret).to.equal("secretValue");
    });

    it("should get secret from manager - fail", async () => {
        const secretName = "secretName";
        const url = `http://localhost:2773/secretsmanager/get?secretId=${encodeURIComponent(secretName)}`;
        mock.onGet(url).reply(500);
        await expect(
            getSecretFromManager(secretName)
          ).to.be.rejectedWith(Error, "Unable to get secret");
    }).timeout(4000);

    it("should get user resource by id - success", async () => {
        let pdvBaseUrl = "https://api.uat.pdv.pagopa.it/user-registry/v1";
        let apiKey = "fakeApiKey";
        let userId = "fakeUserId";
        let fields = ['name', 'familyName', 'fiscalCode'];
        const userResource = {
            name: "Leonardo",
            familyName: "Da Vinci",
            fiscalCode: "DVNLRD52D15M059P"
        };
        let url = pdvBaseUrl + '/users/'  + userId;
        mock.onGet( url, { params: { fl: 'name,familyName,fiscalCode' }} ).reply(200, userResource, {"Content-Type": "application/json"})
        const response = await getUserById(pdvBaseUrl, apiKey, userId, fields);
        console.log("userResource response: ", response);
        expect(response).to.not.be.null;
        expect(response).to.not.be.undefined;
    })

    it("should get user resource by id - fail", async () => {
        let pdvBaseUrl = "https://api.uat.pdv.pagopa.it/user-registry/v1";
        let apiKey = "fakeApiKey";
        let userId = "fakeUserId";
        let fields = ['name', 'familyName', 'fiscalCode'];
        const userResource = {
            name: "Leonardo",
            familyName: "Da Vinci",
            fiscalCode: "DVNLRD52D15M059P"
        };
        let url = pdvBaseUrl + '/users/'  + userId;
        mock.onGet( url, { params: { fl: 'name,familyName,fiscalCode' }} ).reply(500);
        await expect(
            getUserById(pdvBaseUrl, apiKey, userId, fields)
          ).to.be.rejectedWith(Error, "Unable to get user by id");
    });
})

