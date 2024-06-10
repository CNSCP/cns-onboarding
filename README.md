# CNS-Onboarding

## Table of Contents

- [About](#about)
- [Installing](#installing)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [License](#license)
- [Copyright Notice](#copyright-notice)

## About

This repository contains an application that enables device onboarding, written in [Node.js](https://nodejs.org/en/about). The application is used to configure context and token information before running CNS Dapr in a boot  sequence.

At startup, the application checks for the existence of the `CNS_CONTEXT` environment variable and if present, no action is taken and the application exits.

When running, the application asks a broker for context details and does not terminate until those details are received and the appropriate environment variables are set. At this point, the device may continue booting.

## Installing

To **install** or **update** the application, you should fetch the latest version from this Git repository. To do that, you may either download and unpack the repo zip file, or clone the repo using:

```sh
git clone https://github.com/cnscp/cns-onboarding.git
```

Either method should get you a copy of the latest version. It is recommended (but not compulsory) to place the repo in the `~/cns-onboarding` project directory. Go to the project directory and install Node.js dependancies with:

```sh
npm install
```

Your application should now be ready to rock.

## Usage

Once installed, run the application with:

```sh
npm run start
```

To shut down the application, hit `ctrl-c`.

### Environment Variables

The CNS Onboarding application uses the following environment variables to configure itself:

| Name             | Description                      | Default                |
|------------------|----------------------------------|------------------------|
| CNS_BROKER       | CNS Broker service               | 'padi'                 |
| CNS_CODE         | Onboarding code used by broker   | Must be set            |

Alternatively, variables can be stored in a `.env` file in the project directory.

#### Broker Service

The application talks to the broker via the service specified in `CNS_BROKER`.

| Service          | Description                                               |
|------------------|-----------------------------------------------------------|
| padi             | Padi CNS Broker                                           |

##### Padi CNS Broker

The Padi CNS Broker service uses the following environment variables:

| Name             | Description                 | Default                     |
|------------------|-----------------------------|-----------------------------|
| CNS_PADI_API     | Padi API server URI         | 'https<area>://api.padi.io' |
| CNS_PADI_MQTT    | Padi MQTT server URI        | 'wss://cns.padi.io:1881'    |
| CNS_PADI_MODE    | Communication mode          | 'http'                      |
| CNS_PADI_POLL    | Polling period in ms        | '5000'                      |

The communication protocol is set via the mode specified in `CNS_PADI_MODE`.

| Mode             | Description                                               |
|------------------|-----------------------------------------------------------|
| http             | Polling using HTTP requests                               |
| mqtt             | Subscription to a MQTT topic                              |

### Exit codes

| Code             | Description                                               |
|------------------|-----------------------------------------------------------|
| 0                | Environment set, continue                                 |
| 1                | Terminated with error                                     |

## Maintainers

## License

See [LICENSE.md](./LICENSE.md).

## Copyright Notice

See [COPYRIGHT.md](./COPYRIGHT.md).
