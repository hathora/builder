# Authentication

User authentication is critical for establishing user identity. It allows Hathora to know which user called a method, and also which users are subscribed to a state and need to be sent updates. Authentication also allows users to transfer their session from once device to another.

Hathora implements authentication using json web tokens (JWTs). When the client successfully calls one of the available login methods, they obtain a JWT token which they can use for subsequent communication with the server.

## Providers

Hathora's authentication system is designed to be flexible to allow for many different authentication providers. You configure the providers for your application in the `auth` block of `hathora.yml`. At this time, the following providers are supported:

### Anonymous login

Use this method to allow for a seamless method for users to login without providing any credentials. It is very easy to get going but has the downside of making it difficult to transfer sessions across devices.

To configure your application to use anonymous login, simply include the following in your `hathora.yml`:

```yml
auth:
  anonymous: {}
```

### Nickname login

This method allows users to login while providing a nickname with which to identify themselves. It is has the same benefits and downsides as the anonymous login, with the additional benefit of having a custom display name for users.

To configure your application to use nickname login, simply include the following in your `hathora.yml`:

```yml
auth:
  nickname: {}
```

### Google login

This methods allows users to login using their Google account. Provided that the user consents to the Google OAuth prompt, it fetches basic information from their profile like their name and email address.

To configure it, [create authorization credentials](https://developers.google.com/identity/sign-in/web/sign-in#create_authorization_credentials) from the Google developer console and simply paste the client ID you get into your `hathora.yml` as follows:

```yml
auth:
  clientId: 0123456789-abcd1234efgh5678.apps.googleusercontent.com
```

## Client usage

If you're using Hathora's Prototype UI, the user login experience is handled for you out of the box. If you're making a custom frontend, here's how you login using with the different authentication providers:

- anonymous: `const token = await client.loginAnonymous()`
- nickname: `const token = await client.loginNickname(nickname)`
- google: `const token = await client.loginGoogle(googleTokenId)`

To get user profile information from the token, simply call

```ts
const user = HathoraClient.getUserFromToken(token);
```
