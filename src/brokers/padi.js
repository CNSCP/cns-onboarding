// padi.js - CNS Padi broker
// Copyright 2024 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const axios = require('axios');
const mqtt = require('mqtt');

// Constants

const PADI_API = process.env.CNS_PADI_API || 'https://api.padi.io';
const PADI_MQTT = process.env.CNS_PADI_MQTT || 'wss://cns.padi.io:1881';
const PADI_MODE = process.env.CNS_PADI_MODE || 'http';
const PADI_POLL = process.env.CNS_PADI_POLL || 5000;

// Get context for code
function getContext(code) {
  // I promise to
  return new Promise((resolve, reject) => {
    // What mode?
    switch (PADI_MODE) {
      case 'http':
        // via HTTP
        pollContext(code, resolve, reject);
        break;
      case 'mqtt':
        // via MQTT
        mqttContext(code, resolve, reject);
        break;
      default:
        reject(new Error('Mode not valid'));
        return;
    }
  });
}

// Poll for context
function pollContext(code, resolve, reject) {
  // Server set?
  if (PADI_API === '')
    throw new Error('No Padi API server specified');

  // API server
  const api = axios.create({
    baseURL: PADI_API,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Initial poll
  pollTimer(api, code, resolve, reject);
}

// Poll with timer
function pollTimer(api, code, resolve, reject) {
  console.log('HTTP GET Padi onboarding', code);

  // Send onboarding request
  api.get('/onboarding/' + code)
  // Success
  .then((result) => {
    // Resolve response
    response(result.data, resolve, reject);
  })
  // Failure
  .catch((e) => {

//console.log(e);
    // Try again
    setTimeout(() => {
      pollTimer(api, code, resolve, reject);
    }, PADI_POLL);
  });
}

// Subscribe for context
function mqttContext(code, resolve, reject) {
  throw new Error('Not yet implemented');

/*
  // Server set?
  if (PADI_MQTT === '')
    throw new Error('No Padi MQTT server specified');

  console.log('MQTT SUB Padi onboarding', code);

  // Connect client
  const client = mqtt.connect(PADI_MQTT)
  // Client connect
  .on('connect', (connack) => {
    console.log('MQTT CONNECT Padi');
  })
  // Client reconnect
  .on('reconnect', () => {
    console.log('MQTT RECONNECT Padi');
  })
  // Topic message
  .on('message', (topic, data) => {
    console.log('MQTT MESSAGE Padi onboarding', code);
//    client.close();

    response(JSON.parse(data), resolve, reject);
  })
  // Client offline
  .on('offline', () => {
    console.log('MQTT OFFLINE Padi');
  })
  // Client disconnect
  .on('disconnect', (packet) => {
    console.log('MQTT DISCONNECT Padi');
  })
  // Client close
  .on('close', () => {
    console.log('MQTT CLOSE Padi');
  })
  // Client end
  .on('end', () => {
    console.log('MQTT END Padi');
  })
  // Failure
  .on('error', (e) => {
    reject(e);
  });

  // Subscribe to thing
  client.subscribe('onboarding/' + code);
*/
}

// Handle context response
function response(data, resolve, reject) {
  // Response good?
  const thingId = data.padiThing;
  const token = data.padiToken;

  if (thingId === undefined || token === undefined) {
    console.error('Error: Response packet not valid');
    return;
  }

  // Set status
  return setStatus(thingId, token)
  // Success
  .then((result) => {
    // Resolve response
    resolve(toContext(data));
  })
  // Failure
  .catch((e) => {

console.log(e);

    reject(e);
  });
}

// Set profile status
function setStatus(thingId, token) {
  // Server set?
  if (PADI_API === '')
    throw new Error('No Padi API server specified');

  // API server
  const api = axios.create({
    baseURL: PADI_API,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });

  // Post profile status
  return api.post('/thing/client/padi.node/status', '"online"');
//  // Success
//  .then((result) => {
//    // Post thing status
//    return api.post('/thing', {padiStatus: 1});
//  });
}

// Convert to context
function toContext(data) {
  // From Padi onboarding
  return {
    context: data.padiThing || '',
    token: data.padiToken || ''
  };
}

// Exports

exports.getContext = getContext;
