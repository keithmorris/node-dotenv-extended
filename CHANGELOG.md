# Changelog

## 3.0.0 - 2019.12.30
- Now requires Node >= 8
- Update all dependencies to latest (some aren't compatible with Node 6)
- Refactor build file
- Minor code cleanup
- Add ability to set dotenv options from environment variables.

## 2.7.1 - 2019.12.30
- Update README to include `import` syntax

## 2.7.0 - 2019.12.13
- fix: check for extra keys needs to be specific to schema

## 2.5.0 - 2019.10.27
- Update dependencies and remove useless dependencies (thanks @webdevium)
- Modernize and streamline build process

## 2.4.0 - 2019.03.01
- Add ability to put regexs in the `.env.schema` file to validate and limit the values that can be added to the `.evn` and `.env.defaults` files (thanks @epiphone)

## 2.3.0 - 2018.09.13
- Add error checking flag to include process.env when it checks for required variables (thanks @Vija02)

## 2.2.0 - 2018.08.07
- Remove support for end-of-life versions of node (4, 5, 7, 9)
- Require node >=6.0.0
- Update package dependencies

## 2.1.0 - 2018.08.07
-  Expose entire process.env to command called with CLI

## 2.0.2 - 2018.04.16
- Fix markdown header (thanks @vvo)
- Update package dependencies (thanks @gregswindle)
- Add node versions 8 and 9 to travis versions to test

## 2.0.1 - 2017.05.30
- Add TypeScript definitions (thanks @toverux)

## 2.0.0 - 2017.04.26
- Add binary for injecting .env variables into non-node scripts

## 1.0.4 - 2016.10.23
- Replace `winston` library with generic `console` (Thanks @bostrom)

## 1.0.3 - 2016.08.06
- Fix comma-space typo in thrown error (Thanks @niftylettuce)

## 1.0.2 - 2016.08.04
- Add `default` export to simplify ES6 imports

## 1.0.1 - 2016.05.10
- Add ability to load .env files from command line
- Update dependencies

## 1.0.0 - 2016.02.15

- Correct documentation error
- Update dependencies

## 0.1.1 - 2016.02.10
- Remove errant ide files from package
- Add prepublish npm script

## 0.1.0 - 2016.02.09
- Initial release
