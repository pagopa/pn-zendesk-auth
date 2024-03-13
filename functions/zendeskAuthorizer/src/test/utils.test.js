const { decodeToken, generateToken, generateJWTForm } = require("../app/utils");
const { expect } = require("chai");
const axios = require('axios');
var MockAdapter = require("axios-mock-adapter");
var mock = new MockAdapter(axios);

describe("decode token test", function() {
    it("should return decoded token", async () => {
        const decodedToken = decodeToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFhZmQ0ZjllLTRhYmMtNDkwOC04NzMxLWJmNGVhOGI2ZTA4YSJ9.eyJpYXQiOjE3MTAzMjQyMzEsImV4cCI6MTcxMDMyNzQzMSwidWlkIjoiNDE0N2I1NDctODdiOS00YTIzLTk0MjAtY2FjNTc3NTViMjZjIiwiaXNzIjoiaHR0cHM6Ly93ZWJhcGkuZGV2Lm5vdGlmaWNoZWRpZ2l0YWxpLml0IiwiYXVkIjoid2ViYXBpLmRldi5ub3RpZmljaGVkaWdpdGFsaS5pdCIsImp0aSI6Il9lMGQ4N2RkZWE3MDNhMjFmYzQ0NiJ9.dfgkCcagjdnNAakmjbB-YhgGuSd_DpFLd3s8HdWTtefA6pP8BT9BopYLJzBIduxwddQ2A0ac_n6gSTmSXQQg6FUbOtKL-AuCiHfQqXw6OYYw6jhJty86z5JlGuiulOVmUxqTsLYFI5AyFnac7fe_RiuMYZzeWfclUFBEPmYsGrQ-xvR7rlNO5nMYj9bL-2_91RofkBse3-1ITBBA5B9wTTO3sjRQHAEdCcih3Vl9eLatdSpR2VuOPuGBjw31BgiCcTScdtbfMkwdfhlEJdnKTdSrJsQp6hg3C4aPrcqDveOcqJjzo1R3JsIrhL_X5w8SBFasWsmQepMQFmZm2HNp1A")
        console.log("decodedToken: ", decodedToken);
        expect(decodeToken).to.not.be.null;
        expect(decodeToken).to.not.be.undefined;

    });

    it("should return jwt token", async () => {
        const jwtToken = generateToken("Leonardo Da Vinci", "leonardo.davinci@fakemail.it", "DVNLRD52D15M059P", "fakeSecret")
        console.log("jwtToken: ", jwtToken);
        expect(jwtToken).to.not.be.null;
        expect(jwtToken).to.not.be.undefined;
    });

    it("should return html form", async () => {
        const action_url = ""
        const jwt_string = ""
        const return_to = ""
        const htmlForm = generateJWTForm(action_url, jwt_string, return_to);
        console.log("htmlForm: ", htmlForm);
        expect(htmlForm).to.not.be.null;
        expect(htmlForm).to.not.be.undefined;
    })
})

