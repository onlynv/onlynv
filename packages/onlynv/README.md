# onlynv

OnlyNv is a drop-in replacement for [dotenv](https://npm.js.com/package/dotenv). It aims to be as fast and small as possible, and to be fully compatible with dotenv.

This package is part of the broader [OnlyNv](https://github.com/onlynv/onlynv) project, which aims to provide a suite of tools to make working with environment variables easier.

> [!NOTE]  
> If you are on Node.js v20.0.0 or later, you can use the built-in `--env-file` flag to load environment variables from a file. **You do not need this library or `dotenv`**

## Installation

```bash
npm i onlynv
pnpm add onlynv
yarn add onlynv
bun i onlynv
```

## Usage

```javascript
import { config } from 'onlynv';

config(); // ✨
config({ path: ['../.env', '.env.local'] });
config({ encoding: 'utf8' });
```
