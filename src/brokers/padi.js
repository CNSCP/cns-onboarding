// padi.js - CNS Padi broker
// Copyright 2024 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const axios = require('axios');
const mqtt = require('mqtt');

// Errors

const E_MODE = 'invalid mode';
const E_RESPONSE = 'invalid response';

// Defaults

const defaults = {
  CNS_PADI_API: 'https://api.padi.io',
  CNS_PADI_MQTT: 'wss://cns.padi.io:1881',
  CNS_PADI_MODE: 'http',
  CNS_PADI_POLL: 5000
};

// Config

const config = {
  CNS_PADI_API: process.env.CNS_PADI_API || defaults.CNS_PADI_API,
  CNS_PADI_MQTT: process.env.CNS_PADI_MQTT || defaults.CNS_PADI_MQTT,
  CNS_PADI_MODE: process.env.CNS_PADI_MODE || defaults.CNS_PADI_MODE,
  CNS_PADI_POLL: process.env.CNS_PADI_POLL || defaults.CNS_PADI_POLL
};

// Get context for code
function getContext(code) {
  // I promise to
  return new Promise((resolve, reject) => {
    // What mode?
    switch (config.CNS_PADI_MODE) {
      case 'http':
        // via HTTP
        pollContext(code, resolve, reject);
        break;
      case 'mqtt':
        // via MQTT
        mqttContext(code, resolve, reject);
        break;
      default:
        reject(new Error(E_MODE));
        return;
    }
  });
}

// Poll for context
function pollContext(code, resolve, reject) {
  // API server
  const api = axios.create({
    baseURL: config.CNS_PADI_API,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Initial poll
  pollTimer(api, code, resolve, reject);
}

// Poll with timer
function pollTimer(api, code, resolve, reject) {
  // Send onboarding request
  api.get('/onboarding/' + code)
  // Success
  .then((result) => {
    // Resolve response
    response(result.data, resolve, reject);
  })
  // Failure
  .catch((e) => {
    // Try again
    setTimeout(() => {
      pollTimer(api, code, resolve, reject);
    }, config.CNS_PADI_POLL);
  });
}

// Subscribe for context
function mqttContext(code, resolve, reject) {
  // Connect client
  const client = mqtt.connect(config.CNS_PADI_MQTT)
  // Topic message
  .on('message', (topic, data) => {
    // Pass back response
    response(JSON.parse(data), resolve, reject);
  })
  // Failure
  .on('error', (e) => {
    reject(e);
  });

  // Subscribe to code
  client.subscribe('onboarding/' + code);
}

// Handle context response
function response(data, resolve, reject) {
  // Response good?
  const thingId = data.padiThing;
  const token = data.padiToken;

  if (thingId === undefined || token === undefined) {
    reject(new Error(E_RESPONSE));
    return;
  }

  // API server
  const api = axios.create({
    baseURL: config.CNS_PADI_API,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });

  // Set status
  return api.post('/thing/client/padi.node/status', '"online"')
  // Success
  .then((result) => {
    // Resolve response
    resolve({
      context: thingId,
      token: token
    });
  })
  // Failure
  .catch((e) => {
    reject(e);
  });
}

// Exports

exports.getContext = getContext;
