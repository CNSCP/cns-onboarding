// index.js - CNS Onboarding
// Copyright 2024 Padi, Inc. All Rights Reserved.

'use strict';

// Imports

// https://www.npmjs.com/package/dotenv
// const dotenv = require('dotenv').config();

// Constants

const CNS_BROKER = process.env.CNS_BROKER || 'padi';
const CNS_CODE = process.env.CNS_CODE || '';
const CNS_CONTEXT = process.env.CNS_CONTEXT || '';
const CNS_TOKEN = process.env.CNS_TOKEN || '';

// Bindings

const broker = require('./src/brokers/' + CNS_BROKER + '.js');

// Start application
function start() {
  // Check for context
  if (CNS_CONTEXT !== '' && CNS_TOKEN !== '') {
    console.log('Onboarding context: ' + CNS_CONTEXT);
    process.exit(0);
  }

  // Must have code
  if (CNS_CODE === '') {
    console.error('Error: No onboarding code');
    process.exit(1);
  }

  console.log('Onboarding code:', CNS_CODE);
  console.log('Looking for context...');

  // Ask broker for context
  return broker.getContext(CNS_CODE)
  // Success
  .then((result) => {
    //
    console.log('Onboarding context:', result.context);
//    console.log(result);

    // Export result

//process.env.CNS_CONTEXT = result.context;
//process.env.CNS_TOKEN = result.token;

    process.exit(0);
  });
}

// Start application
start().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
