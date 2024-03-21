const axios = require("axios");
const jsonwebtoken = require("jsonwebtoken");
const uuid = require('uuid');
const Mustache = require('mustache');
const { GetSecretValueCommand, SecretsManagerClient} = require('@aws-sdk/client-secrets-manager');
const fs = require("fs");

const secretsCache = {};
const client = new SecretsManagerClient();

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
      console.error("Unable to get secret ", err);
      throw new Error("Unable to get secret");
    }
}

async function getSecretFromManagerLayer(secretName) {
    return await retryWithDelay(
        () => innerGetSecretFromManager(secretName),
        1000,
        3
      );
}

function decodeToken(jwtToken) {
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
    try {
      return jsonwebtoken.sign(payload, zendeskSecret)
    } catch(err) {
        console.error('Unable to generate token:', err);
        throw new Error("Unable to generate token");
    }
    
}

function generateJWTForm(action_url, jwt_string, return_to) {
    const template = fs.readFileSync("./src/app/templateForm.txt");

    const view = {
        action_url: action_url,
        jwt_string: jwt_string,
        return_to: return_to
    };
    try {
      return Mustache.render(template.toString(), view);
    }catch(err) {
        console.error('Unable to generate JWT form:', err);
        throw new Error("Unable to generate JWT form");
    }
    
}

async function getUserById(pdvBaseUrl, apiKey, id, fields) {
    try {
        const response = await axios.get(`${pdvBaseUrl}/users/${id}`, {
            headers: {
                'x-api-key': apiKey
            },
            params: {
                fl: fields.join(',')
            }
        });
        return response.data;
    } catch (error) {
        console.error('Unable to get user by id:', error);
        throw new Error("Unable to get user by id");
    }
}

function generateProblem(status, message) {
    return {
        status: status,
        errors: [
            {
                code: message
            }
        ]
    }
}

async function getSecretFromManager(secretArn) {
    if (secretsCache[secretArn]) {
        console.log('Segreto trovato nella cache');
        return secretsCache[secretArn];
    } 

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretArn,
          }),
        );
        if (response.SecretString) {
            secretsCache[secretArn] = response.SecretString;
            return JSON.parse(response.SecretString);
        }
    } catch(err) {
        console.error("Unable to get secret ", err);
        throw new Error("Unable to get secret");
    }
}

module.exports = {
    getSecretFromManager,
    getSecretFromManagerLayer,
    decodeToken,
    generateToken,
    generateJWTForm,
    getUserById,
    generateProblem
}