<div align="center">
    <h1>
    <img src="https://raw.githubusercontent.com/onlynv/onlynv/main/assets/logo/svg/logo-dark-squircle.svg" alt="OnlyNv Logo" width="128">
    <br>
    OnlyNv CLI
    </h1>
    <em>What if your .env was the only .env?</em>
</div>

<br>

The OnlyNv CLI provides a conventient interface to communicate with your OnlyNv authority.

## How?

It's as simple as three commands:

1. Run `nv init` to create a new project on [onlynv.dev](https://onlynv.dev)[^1]
2. Run `nv link` to authenticate your device with the authority.
3. Run `nv sync` to sync your variables!

[^1]: You can specify a third-party authority by providing a second argument: `nv init https://my-authority.com`

## More commands

In addition to those aforementioned, the CLi also offers:

-   `nv ping` - Check the connection status of your authority.
-   `nv glob` - View all env files known to the CLI
-   `nv stow` - For granular management of access tokens.

<br />

-   `nv version` or `nv -v`
-   `nv help` or `nv -h`
