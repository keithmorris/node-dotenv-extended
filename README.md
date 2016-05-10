# dotenv-extended

[![Build Status](https://travis-ci.org/keithmorris/node-dotenv-extended.svg?branch=develop)](https://travis-ci.org/keithmorris/node-dotenv-extended)
[![Coverage Status](https://coveralls.io/repos/github/keithmorris/node-dotenv-extended/badge.svg?branch=develop)](https://coveralls.io/github/keithmorris/node-dotenv-extended?branch=develop)
[![Dependency Status](https://david-dm.org/keithmorris/node-dotenv-extended.svg)](https://david-dm.org/keithmorris/node-dotenv-extended)


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

###`.env.defaults`

Common configuration defaults across all environments (commited to source control). This contains overall app configuration values that would be common across environments. The `.env.defaults` file is loaded first and then the `.env` file is loaded and will overwrite any values from the `.env.defaults` file. Format is identical to the `.env` file.

### `.env.schema`

Defines a schema of what variables _should_ be defined in the combination of `.env` and `.env.defaults`. Optionally, you can have the libarary throw and error if all values are not configured or if there are extra values that shouldn't be there.


The `.env.schema` file should only have the name of the variable and the `=` without any value:

```
MONGO_HOST=
MONGO_DATABASE=
MONGO_USER=
MONGO_PASS=
```


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
```
node -r dotenv-extended/config your_script.js
```

Or to specify load options:

```
node -r dotenv-extended/config your_script.js dotenv_config_path=./env/.env dotenv_config_defaults=./env/.env.defaults
```

## Options

Defaults are shown below:

```
require('dotenv-extended').load({
	encoding: 'utf8',
	silent: true,
	path: '.env',
	defaults: '.env.defaults',
	schema: '.env.schema',
	errorOnMissing: false,
	errorOnExtra: false,
	assignToProcessEnv: true,
	overrideProcessEnv: false
});
```

The function always returns an object containing the variables loaded from the `.env` and `.env.defaults` files. The returned object does not contain the properties held in `process.env` but rather only the ones that are loaded from the `.env` and `.env.defaults` files.

```
var myConfig = require('dotenv-extended').load();
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
DB_HOST=
DB_USER=
DB_PASS=
DB_DATABASE=
API_KEY=
```

### Load files with default options

```
var myConfig = require('dotenv-extended').load();

myConfig.DB_HOST === process.env.DB_HOST === "localhost"
myConfig.DB_USER === process.env.DB_USER === "databaseuser-local"
myConfig.DB_PASS === process.env.DB_PASS === "localhost"
myConfig.DB_DATABASE === process.env.DB_DATABASE === "MyAppDB"
myConfig.SHARE_URL === process.env.SHARE_URL === "http://www.example.com"
```

### Load files with `errorOnMissing`

```
var myConfig = require('dotenv-extended').load({
    errorOnMissing: true
});

Throws ERROR `MISSING CONFIG VALUES: API_KEY`
```

### Load files with `errorOnExtra`

```
var myConfig = require('dotenv-extended').load({
    errorOnExtra: true
});

Throws ERROR `EXTRA CONFIG VALUES: SHARE_URL`
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Change Log

See [CHANGELOG.md](CHANGELOG.md)

## License

See [LICENSE](LICENSE)

[dotenv]: https://www.npmjs.com/package/dotenv
