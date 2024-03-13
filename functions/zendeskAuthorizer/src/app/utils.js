const axios = require("axios");
const jsonwebtoken = require("jsonwebtoken");
const uuid = require('uuid');
const Mustache = require('mustache');

async function retryWithDelay(fn, delay, retries) {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, delay));
        return await retryWithDelay(fn, delay, retries - 1);
      } else {
        throw err;
      }
    }
}

async function innerGetSecretFromManager(secretName) {
    try {
      const response = await axios.get(
        `http://localhost:2773/secretsmanager/get?secretId=${encodeURIComponent(
            secretName
        )}`,
        {
          headers: {
            "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN,
          },
        }
      );
      return response.data.SecretString;
    } catch (err) {
      console.error("Error in get secret ", err);
      throw new Error("Error in get secret");
    }
}

async function getSecretFromManager(secretName) {
    return await retryWithDelay(
        () => innerGetSecretFromManager(secretName),
        1000,
        3
      );
}

function decodeToken(jwtToken) {
    console.log("Start decoding token");
    const decodedToken = jsonwebtoken.decode(jwtToken, { complete: true });
    return decodedToken;
}

function generateToken(name, email, taxId, zendeskSecret) {
    const payload = {
        iat: Math.floor(new Date().getTime() / 1000),
        jti: uuid.v4(),
        name: name,
        email: email,
        organization: '_users_hc_send',
        user_fields: { aux_data:  taxId }
    };
    return jsonwebtoken.sign(payload, zendeskSecret)
}

function generateJWTForm(action_url, jwt_string, return_to) {
    const template = `
        <form id="jwtForm" method="POST" action="{{action_url}}">
            <input id="jwtString" type="hidden" name="jwt" value="{{jwt_string}}" />
            <input id="returnTo" type="hidden" name="return_to" value="{{return_to}}" />
        </form>
        <script>
            window.onload = () => { document.forms["jwtForm"].submit(); };
        </script>
    `;

    const view = {
        action_url: action_url,
        jwt_string: jwt_string,
        return_to: return_to
    };

    return Mustache.render(template, view);
}

module.exports = {
    getSecretFromManager,
    decodeToken,
    generateToken,
    generateJWTForm
}