const axios = require("axios");

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

module.exports = {
    getSecretFromManager
}