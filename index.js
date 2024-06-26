// index.js - CNS Onboarding
// Copyright 2024 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

const env = require('dotenv').config();
const fs = require('fs');

const pack = require('./package.json');

// Errors

const E_CODE = 'no code';
const E_ABORTED = 'aborted';

// Defaults

const defaults = {
  CNS_BROKER: 'padi',
  CNS_CODE: '',
  CNS_CONTEXT: '',
  CNS_TOKEN: ''
};

// Config

const config = {
  CNS_BROKER: process.env.CNS_BROKER || defaults.CNS_BROKER,
  CNS_CODE: process.env.CNS_CODE || defaults.CNS_CODE,
  CNS_CONTEXT: process.env.CNS_CONTEXT || defaults.CNS_CONTEXT,
  CNS_TOKEN: process.env.CNS_TOKEN || defaults.CNS_TOKEN
};

// Display wait text
function wait(text, promise) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  var index = 0;

  const timer = setInterval(() => {
    process.stdout.write('\r' + frames[index] + ' ' + text);
    index = (index + 1) % frames.length;
  }, 250);

  return promise.then((result) => {
    clearInterval(timer);
    process.stdout.write('\r\x1b[K');
    return result;
  });
}

// Start application
async function start() {
  console.log('CNS Onboarding', pack.version);

  // Check for context
  if (config.CNS_CONTEXT !== '' && config.CNS_TOKEN !== '') {
    console.log('✓ CNS context:', config.CNS_CONTEXT);
    process.exit(0);
  }

  // Must have code
  if (config.CNS_CODE === '')
    throw new Error(E_CODE);

  // Wait for signal
  console.log('✓ CNS code:', config.CNS_CODE);

  // Bind the broker
  const broker = require('./src/brokers/' + config.CNS_BROKER + '.js');

  // Ask broker for context
  return wait('Looking for context...', broker.getContext(config.CNS_CODE))
  // Success
  .then((result) => {
    console.log('✓ CNS context:', result.context);

    // Create new env data
    const data = {};

    for (const name in env.parsed)
      data[name] = env.parsed[name];

    data.CNS_CONTEXT = result.context;
    data.CNS_TOKEN = result.token;

    // Construct env file
    var text = '// Generated by ' + pack.name + ' on ' + new Date().toISOString() + '\n';

    for (const name in data)
      text += name + '=' + data[name] + '\n';

    // Write env file
    fs.writeFileSync('.env', text, 'utf8');
    process.exit(0);
  });
}

// Catch terminate
process.on('SIGINT', () => {
  console.error('\r\x1b[K𐄂 Error:', E_ABORTED);
  process.exit(1);
});

// Start application
start().catch((e) => {
  console.error('\r\x1b[K𐄂 Error:', e.message);
  process.exit(1);
});
