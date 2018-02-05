# Augmint Web Frontend - development environment

## Install

_We recently split the codebase into [`augmint-web`](https://github.com/Augmint/augmint-web) and [`augmint-contracts`](https://github.com/Augmint/augmint-contracts). Please raise an issue if these instructions shouldn't work for you._

These instructions are about the dev environment for frontebd development. For contract development see [augmint-contracts repo](https://github.com/Augmint/augmint-contracts)

### OSX

_NB: these steps are likely to work on linux too but it's not tested yet_

1. [Git](https://git-scm.com/download)
1. [Ethereum CLI](https://www.ethereum.org/cli)
1. [nodejs](https://nodejs.org/en/download/) v8.5.0  
   _use version 8.5.0, ganache regularly crashes with newer version (FE also works with 8.9.4)_
1. then:
    ```
    git clone https://github.com/Augmint/augmint-web.git`
    cd augmint-web`
    npm install`
    cd augmint-contracts`
    npm install
    ```

### Windows

_Note: windows install was not tested since a while, update on it is welcome_

1. [Git Bash](https://git-for-windows.github.io/) (required for truffle & yarn start)
1. [Git](https://git-scm.com/download) (if you haven't installed it as part of Git Bash in previous step)
1. [Ethereum CLI](https://www.ethereum.org/cli) - including development tools
1. [Node Version Manager(NVM)](https://github.com/coreybutler/nvm-windows/releases)
1. in Git bash:
    ```
    nvm install 8.5.0
    nvm use 8.5.0
    git clone https://github.com/Augmint/augmint-web.git
    cd augmint-core
    npm install
    cd augmint-contracts
    npm install
    ```

## Launch

### 1. Update to latest augmint-web

```
git pull
npm install # if there were any node package changes in packages.json
```

### 2. Update to latest augmint contract

```
cd augmint-contracts
git checkout master
git pull
npm install # if there were any node package changes in packages.json
```

### 3. Launch

#### 3.1 Start ganache-cli (formerly testrpc)

`npm run ganache:runmigrate`  
or  
`npm run ganache:run` and in separate console:  
`npm run truffle:migrate`  
or  
`$(npm bin)/truffle migrate --reset` to overwrite existing migration

NB: if you have connection error on the UI then likely `src/contractsBuild` is not up to date: run `npm run truffle:migratecopy`
but make sure you don't check in changes in `src/contractsBuild` folder (rather raise an issue so we can fix it)

#### 3.2. Launch local dev server

`yarn start`

_NB: If you are using Metamask on local chain and you restart the local chain then your consecutive transactions will fail with [`Invalid nonce` error](https://github.com/MetaMask/metamask-extension/issues/1999). You will need to [reset your account in Metamask](http://metamask.helpscoutdocs.com/article/36-resetting-an-account)._

## UI development

UI is built with [semantic-ui](https://www.semantic-ui.com) and [semantic-ui-react](https://react.semantic-ui.com).

_NB: we are transitioning from semantic-ui to a more suitable framework_

To customize it you need to edit dcm theme in [src/semantic/themes/dcm](src/semantic/themes/dcm) folder.

### css build

```
cd src/semantic
gulp build-css
gulp build-assets
```

You can also use `gulp watch`

## Tests

### FrontEnd - E2E

_Note: Frontend tests are experimental and unfinished yet. Also [ganache crashes occasionally](https://github.com/trufflesuite/ganache-cli/issues/453#issuecomment-359954713) so CI is not running it for now_

* Start interactive: `npm run cypress:open`
* Start command line: `npm run cypress:run`

## Non ganache launches/deploys

See [augmint-contracts repo](https://github.com/Augmint/augmint-contracts)
