# dotenv-extended

[![Build Status](https://travis-ci.org/keithmorris/node-dotenv-extended.svg?branch=develop)](https://travis-ci.org/keithmorris/node-dotenv-extended)
[![Coverage Status](https://coveralls.io/repos/github/keithmorris/node-dotenv-extended/badge.svg?branch=develop)](https://coveralls.io/github/keithmorris/node-dotenv-extended?branch=develop)
[![Dependency Status](https://david-dm.org/keithmorris/node-dotenv-extended.svg)](https://david-dm.org/keithmorris/node-dotenv-extended)

### IMPORTANT

As of version 3.0.0, `dotenv-extended` requires Node JS >= 8 due to updated dependencies with security fixes that are not compatible with Node 7 and below.

### About

I've been a big fan of the [dotenv] for a quite some time (in fact, this library uses [dotenv] under the hood for the `.env` file parsing). However, while working on some bigger projects, we realized that the managing of the `.env` files became a bit of a chore. As the files changed in the development environments, it became a tedious manual process to compare and figure out what needed to be added or removed in the other environments.

This library solves some of these issues by introducing the concept of 3 files which are used together to provide environment-specific variables, default values and a validation schema:

### `.env`

The environment specific file (not committed to source control). This file will have sensitive information such as usernames, passwords, api keys, etc. These would be specific to each environment and should not be committed to source control. The format is a series of key-value pairs. Any line starting with `#` or `;` are commented out and ignored.

```
# .env file
MONGO_HOST=localhost
MONGO_DATABASE=TestDB
MONGO_USER=dbusername
MONGO_PASS=dbpassword!
```

### `.env.defaults`

Common configuration defaults across all environments (commited to source control). This contains overall app configuration values that would be common across environments. The `.env.defaults` file is loaded first and then the `.env` file is loaded and will overwrite any values from the `.env.defaults` file. Format is identical to the `.env` file.

### `.env.schema`

Defines a schema of what variables _should_ be defined in the combination of `.env` and `.env.defaults`. Optionally, you can have the library throw an error if all values are not configured or if there are extra values that shouldn't be there.


The `.env.schema` file should only have the name of the variable and the `=` without any value:

```
# .env.schema
MONGO_HOST=
MONGO_DATABASE=
MONGO_USER=
MONGO_PASS=
```

Additionally `.env.schema` can include regular expressions; see [below](#load-files-with-erroronregex) for how to configure the library to throw an error upon failed regex validation.

I have tried to stay as compatible as possible with the [dotenv] library but there are some differences.

## Installation

```
npm i --save dotenv-extended
```

## Usage

As early as possible in your main script:

```
require('dotenv-extended').load();
```

Or if you prefer import syntax:

```
import dotEnvExtended from 'dotenv-extended';
dotEnvExtended.load(); 
```

Create a `.env` file in the root directory of your project. Add environment-specific variables on new lines in the form of `NAME=VALUE`.

For example:

```
MONGO_HOST=localhost
MONGO_DATABASE=TestDB
MONGO_USER=dbusername
MONGO_PASS=dbpassword!
```

`process.env` now has the keys and values you defined in your `.env` file.

```javascript
mongoose.connect('mongodb://' + process.env.MONGO_HOST + '/' + process.env.MONGO_DATABASE, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS
});
```

### Load Configs from command line

You may also load the `.env` files from the command line. Add in the require `dotenv-extended/config` along with any of the options that the `load` method takes prefixed with `dotenv_config_`. e.g.:
```bash
node -r dotenv-extended/config your_script.js
```

Or to specify load options:

```bash
node -r dotenv-extended/config your_script.js dotenv_config_path=./env/.env dotenv_config_defaults=./env/.env.defaults
```

You can also set configuration options via environment variables (See additional info on using environment variables for configuration below):

```bash
export DOTENV_CONFIG_PATH=./env/.env
export DOTENV_CONFIG_DEFAULTS=./env/.env.defaults
node -r dotenv-extended/config your_script.js
```

### Load Environment Variables and pass to non-NodeJS script

New in 2.0.0, is a feature inspired by [cross-env](https://www.npmjs.com/package/cross-env) to allow you to load environment variables from your `.env` files and then pass them into a non-NodeJS script such as a shell script. This can simplify the process of maintaining variables used in both your Node app and other scripts. To use this command line executable, you will either need to install globally with the `-g` flag, or install `dotenv-extended` in your project and reference it from your npm scripts.

Install Globally:

```
npm install -g dotenv-extended
```

Now call your shell scripts through `dotenv-extended` (this uses the defaults):

```
dotenv-extended ./myshellscript.sh --whatever-flags-my-script-takes
```

Configure `dotenv-extended` by passing any of the dotenv-extended options before your command. Preceed each option with two dashes `--`:

```
dotenv-extended --path=/path/to/.env --defaults=/path/to/.env.defaults --errorOnMissing=true ./myshellscript.sh --whatever-flags-my-script-takes
```

The following are the flags you can pass to the `dotenv-extended` cli with their default values. these options detailed later in this document:

```bash
--encoding=utf8
--silent=true
--path=.env
--defaults=.env.defaults
--schema=.env.schema
--errorOnMissing=false     # or --error-on-missing=false
--errorOnExtra=false       # or --error-on-extra=false
--errorOnRegex=false       # or --error-on-regex=false
--includeProcessEnv=false  # or --include-process-env=false
--assignToProcessEnv=true  # or --assign-to-process-env=true
--overrideProcessEnv=false # or --override-process-env=true
```

You can also set configuration options via environment variables (See additional info on using environment variables for configuration below):

```bash
export DOTENV_CONFIG_PATH=/path/to/.env 
export DOTENV_CONFIG_DEFAULTS=/path/to/.env.defaults
export DOTENV_CONFIG_ERROR_ON_MISSING=true
dotenv-extended ./myshellscript.sh --whatever-flags-my-script-takes
```

## Options

Defaults are shown below:

```javascript
require('dotenv-extended').load({
	encoding: 'utf8',
	silent: true,
	path: '.env',
	defaults: '.env.defaults',
	schema: '.env.schema',
	errorOnMissing: false,
	errorOnExtra: false,
	errorOnRegex: false,
	includeProcessEnv: false,
	assignToProcessEnv: true,
	overrideProcessEnv: false
});
```

The function always returns an object containing the variables loaded from the `.env` and `.env.defaults` files. The returned object does not contain the properties held in `process.env` but rather only the ones that are loaded from the `.env` and `.env.defaults` files.

```javascript
var myConfig = require('dotenv-extended').load();
```
### Set configuration options through environment variables (new in 3.0.0)

You can also set `dotenv-extended` configuration options from environment variables prefixed with `DOTENV_CONFIG_`. The order of loading is Default Options > Environment Variables > Options passed to `load` function. The configuration options are overridden by each subsequent set of values. Here are the possible environment variables with the defaults:

```
DOTENV_CONFIG_ENCODING='utf8'
DOTENV_CONFIG_SILENT='true'
DOTENV_CONFIG_PATH='.env'
DOTENV_CONFIG_DEFAULTS='.env.defaults'
DOTENV_CONFIG_SCHEMA='.env.schema'
DOTENV_CONFIG_ERROR_ON_MISSING='false'
DOTENV_CONFIG_ERROR_ON_EXTRA='false'
DOTENV_CONFIG_ERROR_ON_REGEX='false'
DOTENV_CONFIG_INCLUDED_PROCESS_ENV='false'
DOTENV_CONFIG_ASSIGN_TO_PROCESS_ENV='true'
DOTENV_CONFIG_OVERRIDE_PROCESS_ENV='false'
```

### encoding (_default: utf8_)

Sets the encoding of the `.env` files

### silent (_default: true_)

Sets whether a log message is shown when missing the `.env` or `.env.defaults` files.

### path (_default: .env_)

The main `.env` file that contains your variables.

### defaults (_default: .env.defaults_)

The file that default values are loaded from.

### schema (_default: .env.schema_)

The file that contains the schema of what values should be available from combining `.env` and `.env.defaults`

### errorOnMissing (_default: false_)

Causes the library to throw a `MISSING CONFIG VALUES` error listing all of the variables missing the combined `.env` and `.env.defaults` files.

### errorOnExtra (_default: false_)

Causes the library to throw a `EXTRA CONFIG VALUES` error listing all of the extra variables from the combined `.env` and `.env.defaults` files.

### errorOnRegex (_default: false_)

Causes the library to throw a `REGEX MISMATCH` error listing all of the invalid variables from the combined `.env` and `.env.defaults` files. Also a `SyntaxError` is thrown in case `.env.schema` contains a syntactically invalid regex.

### includeProcessEnv (_default: false_)

Causes the library add process.env variables to error checking. The variables in process.env overrides the variables in .env and .env.defaults while checking

### assignToProcessEnv (_default: true_)

Sets whether the loaded values are assigned to the `process.env` object. If this is set, you must capture the return value of the call to `.load()` or you will not be able to use your variables.

### overrideProcessEnv (_default: false_)

By defaut, `dotenv-entended` will not overwrite any varibles that are already set in the `process.env` object. If you would like to enable overwriting any already existing values, set this value to `true`.

## Examples

Consider the following three files:

```
# .env file
DB_HOST=localhost
DB_USER=databaseuser-local
DB_PASS=databasepw!
SHARE_URL=http://www.example.com
```

```
# .env.defaults
DB_USER=databaseuser
DB_DATABASE=MyAppDB
```

```
# .env.schema
DB_HOST=[a-z]+
DB_USER=[a-z]+
DB_PASS=
DB_DATABASE=
API_KEY=
```

### Load files with default options

```javascript
var myConfig = require('dotenv-extended').load();

myConfig.DB_HOST === process.env.DB_HOST === "localhost"
myConfig.DB_USER === process.env.DB_USER === "databaseuser-local"
myConfig.DB_PASS === process.env.DB_PASS === "localhost"
myConfig.DB_DATABASE === process.env.DB_DATABASE === "MyAppDB"
myConfig.SHARE_URL === process.env.SHARE_URL === "http://www.example.com"
```

### Load files with `errorOnMissing`

```javascript
var myConfig = require('dotenv-extended').load({
    errorOnMissing: true
});

// Throws ERROR `MISSING CONFIG VALUES: API_KEY`
```

### Load files with `errorOnExtra`

```javascript
var myConfig = require('dotenv-extended').load({
    errorOnExtra: true
});

// Throws ERROR `EXTRA CONFIG VALUES: SHARE_URL`
```

### Load files with `errorOnRegex`

```javascript
var myConfig = require('dotenv-extended').load({
    errorOnRegex: true
});

// Throws ERROR `REGEX MISMATCH: DB_USER`
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Change Log

See [CHANGELOG.md](CHANGELOG.md)

## License

See [LICENSE](LICENSE)

[dotenv]: https://www.npmjs.com/package/dotenv
