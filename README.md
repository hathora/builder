# rtag - real time app generator

## Overview

Rtag is a framework that aims to simplify application development by allowing the developer focus only on application-specific logic, without having to think about adjacent concerns such as infrastructure, tooling, networking, storage, etc.

Rtag uses a YAML file (`rtag.yml`) to define the application specification. The developer declares the client data model, mutation functions, and other relevant configuration in this file. Rtag then uses this specification to automatically generate several key components:
- server side method stubs that set up the entire server code structure and just need to be filled in with the application's business logic
- clients for frontends to use to communicate with the rtag server in a typesafe manner
- a web-based debug application that allows for testing backend logic right away without writing any frontend code

Rtag also comes with a powerful development server with features like hot code reloading and live code bundling, which aim to get out of the way of the developer and create an enjoyable development experience. 

## Installation

#### Requirements

- node v15+

Install rtag from the npm registry:

```
npm install -g rtag
```

## Quickstart

1. Inside a new directory, create a `rtag.yml` file and fill it out as per your project specifications (see below)
2. Run `rtag init` to generate your initial rtag project. For subsequent changes made to `rtag.yml`, run `rtag` instead
3. Run `rtag install` to install dependencies
4. Start the server using `rtag start`
5. View debug app at http://localhost:3000/

## App configuration (rtag.yml)

Rtag apps contain a yaml configuration file in the root directory. This file sets up the contract between client and server and contains other relevant configuration for the application.

#### Client state object

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

#### Mutation methods

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

#### Authentication

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

#### Internal state

The server side representation of a single state instance.

#### Initialize method

Returns the initial internal state based on the user context and arguments.

#### Mutation methods

Modify internal state based on the user context and arguments. Perform input/state validation by returning an error result if invalid request or a success result otherwise.

#### getUserState method

Maps from the internal state to the user state based on the user context. This mapping allows privacy rules to be enforced so that the user only gets the data they should have access to.

#### onTick method

Server ticks can be enabled by setting `tick: true` in `rtag.yml`.

This method is called at a regular interval in the server and has access to the internal state. It is used for background tasks that can update the state, e.g. physics simulations etc.

## Frontend

One of rtag's most powerful prototyping features is the generated debug app, which lets you interact with your application and test your backend logic without writing any frontend code. Furthermore, rtag provides ways to incrementally add custom presentation logic as you become ready for it.

#### Plugins

Plugins go inside the `client/plugins` directory. To create a plugin for type `Foo`, create a file named `Foo.ts` and rerun the `rtag` command. This will cause the debug app to render your plugin's component anywhere `Foo` shows up in the state tree (instead of the rendering the default json view).

Your plugin must export a webcomponent (a class that extends `HTMLElement`). While you are free to write a native webcomponent without any dependencies, most popular frontend libraries have ways to create webcomponents. Some examples include:
- React (via https://github.com/bitovi/react-to-webcomponent)
- Vue (via https://github.com/vuejs/vue-web-component-wrapper)
- Lit (no wrapper required)

Plugins receive the following props as input:
- val -- this is the value you are rendering, it has the type of your filename
- state -- this is the entire state tree, it has the type of `userState`
- client -- this is the rtag client instance (so you can make method calls from within your plugin), with type `RtagClient`

#### Fully custom frontend

When you're ready to move away from the debug app, create an `index.html` file at the root of the `client` directory and rerun the `rtag` command. This file now serves as the entry point to your frontend. You are free to use any technologies you wish to build your frontend, just make sure to import the generated client to communicate with the rtag server.
