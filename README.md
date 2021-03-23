# rtag - real time app generator

## Installation

### Requirements

- node v15+
- ts-node on classpath (`npm install -g ts-node`)

Install rtag from the npm registry:

```
npm install -g rtag
```

## Quickstart

1. Inside a new directory, create a `rtag.yml` file, fill it out as per your project specifications (see below), and run `rtag` to generate your rtag project
2. Run `rtag install` to install dependencies
3. Start the server using `rtag start`
4. View debug app at http://localhost:3000/

## App configuration (rtag.yml)

Rtag apps contain a yaml configuration file in the root directory. This file sets up the contract between client and server and contains other relevant configuration for the application.

### Client state object

This is the state object each connected client will have access to. Rtag automatically keeps the client state up to date as it is updated in the server.

The client state definition lives inside the `types` section, and is referenced using `userState`:

```yml
types:
  MyIdAlias: string
  MyEnum:
    - VAL_1
    - VAL_2
  MyState:
    id: MyIdAlias
    enum: MyEnum
    bool: boolean
    num: number
    str: string
    arr: string[]
    opt?: string
userState: MyState
```

A custom error type can also be defined, although in many cases using a primitive `string` type may suffice:

```yml
error: string
```

### Mutation methods

Methods are the way through which the state can be modified in the server. Methods take 0 or more user-defined arguments and have to be implemented in the server, possibly mutating the state and returning either a success or error response.

The method signatures are defined under the `methods` section. The argument types can be primitives or can reference types defined in the `types` section. One of the methods must be designated as the `initialize` function, which is responsible for creating the initial version of the state.

```yml
methods:
  doSomeAction:
    arg1: string
    arg2: MyEnum[]
  emptyMethod:
  createState:
    conf: MyConfiguration
initialize: createState
```

### Authentication

The `auth` section is used to configure the authentication modes that the application can use. The two currently supported modes are `anonymous` and `google`. At least one authentication method must be configured.

```yml
auth:
  anonymous:
    separator: "-"
  google:
    clientId: <PUBLIC_GOOGLE_APP_ID>.apps.googleusercontent.com
```

## Backend

The entry point for the application's backend logic lives in the root of the `server` directory, in a file called `impl.ts`.

### Internal state

The server side state representation.

### Initialize

Returns the initial internal state based on the user context and arguments.

### Mutation methods

Modifies internal state based on the user context and arguments. Returns a success or error result.

### getUserState

Maps from the internal state to the user state based on the user context. This mapping allows privacy rules to be enforced so that the user only gets the data they should have access to.

## Frontend

One of rtag's most powerful prototyping features is the generated debug app, which lets you interact with your application and test your backend logic without writing any frontend code. Furthurmore, rtag provides ways to incrementally add custom presentation logic as you become ready for it.

### Plugins

Plugins go inside the `client/plugins` directory. To create a plugin for type `Foo`, create a filed named `Foo.ts` and rerun `rtag`.

TODO explain how plugins work

### Fully custom frontend

When you're ready to move away from the debug app, create an `index.html` file at the root of the `client` directory and rerun `rtag`. This file now serves as the entry point to your frontend. You are free to use any technologies you wish to build your frontend, just make sure to import the generated client to communicate with the rtag server.
