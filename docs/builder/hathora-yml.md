# Hathora Builder - Reference: hathora.yml

## types

The `types` section is used to define the API data objects.

Supported types include string, int, float, boolean, enum, optional, array, object, and union. There is also a special `UserId` type available.

Example:

```yml
types:
  MyAlias: string
  MyEnum:
    - VAL1
    - VAL2
  MyObj1:
    userId: UserId
    myString: string
    myInteger: int
    myDecimal: float
    myBool: boolean
    myEnum: MyEnum
  MyObj2:
    myOptional: MyEnum?
    myArray: MyAlias[]
    myObj: MyObj1
  MyUnion:
    - MyObj1
    - MyObj2
```

## methods

The `methods` section is used to define the API methods.

Methods can have 0 or more arguments, the type of which come from the `types` section.

Example:

```yml
methods:
  methods:
    doSomeAction:
      arg1: string
      arg2: MyEnum[]
    emptyMethod:
    createState:
      conf: MyObj2
```

## auth

The `auth` section is used to configure the authentication modes that the application can use. The two currently supported modes are `anonymous` and `google`. At least one authentication method must be configured.

Example:

```yml
auth:
  anonymous: {}
  google:
    clientId: 0123456789-abcd1234efgh5678.apps.googleusercontent.com
```

## userState

The `userState` key represents the data type the client has access to from the server. As state is mutated via methods, the server broadcasts updates to keep clients in sync with the latest version of the data.

Example:

```yml
userState: MyUnion
```

## events

The `events` section is used to configure the event types you can send from the server and receive from the client.

Example:

```yml
# hathora.yml

types:
  SomeType:
    foo: string
events:
  myEvent: SomeType
  myOtherEvent: number
```

Which could then be used on the server like this:

```ts
ctx.sendEvent(HathoraEvents.myEvent, { foo: "bar" }, userId)
```

If omitted from `hathora.yml`, the `events` block defaults to the following:

```yml
events:
  default: string
```

## initializeArgs

The optional `initializeArgs` key sets the `InitializeRequest` type for the `initialize` method. By default it is empty.

## error

The `error` key represents the response type the server sends when a method call fails.

## tick

The optional `tick` configures whether or not the backend will run an `onTick` function at a configurable interval. See the [Server](builder/server.md) section for more details.
