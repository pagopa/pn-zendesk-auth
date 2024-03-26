const { handleEvent } = require("./src/app/eventHandler.js");

async function handler(event) {
  return handleEvent(event);
}

exports.handler = handler;