# Augmint Web Frontend - development environment

## Install

These instructions are about the dev environment for frontend development. For contract development see [augmint-contracts repo](https://github.com/Augmint/augmint-contracts)

[![Osx setup video](./devenvvideo_thumbnail.png)](https://www.youtube.com/watch?v=agu5LxOcy1c)

### OSX / Linux

1. [Git](https://git-scm.com/download)
1. [Ethereum CLI](https://www.ethereum.org/cli)
1. Install [nodejs](https://nodejs.org/en/download/) - _tested with v8.9.4 LTS_

    or install nodejs with [n node version manager](https://github.com/tj/n):

    ```
    npm install -g n
    n 8.9.4
    ```

1. Install yarn if you don't have it: `npm install -g yarn`
1. ```
   git clone https://github.com/Augmint/augmint-web.git --recurse-submodules
   cd augmint-web
   yarn install
   cd augmint-contracts
   yarn install
   ```

### Windows

_Note: windows install was not tested since a while, update on it is welcome_

1. [Git Bash](https://git-for-windows.github.io/) (required for truffle & yarn start)
1. [Git](https://git-scm.com/download) (if you haven't installed it as part of Git Bash in previous step)
1. [Ethereum CLI](https://www.ethereum.org/cli) - including development tools
1. [nodejs](https://nodejs.org/en/download/) - _tested with v8.9.4 LTS_

    or install nodejs with [Node Version Manager(NVM)](https://github.com/coreybutler/nvm-windows/releases):

    ```
    nvm install 8.9.4
    nvm use 8.9.4
    ```

1. Install yarn if you don't have it: `npm install -g yarn`
1. in Git bash:
    ```
    git clone https://github.com/Augmint/augmint-web.git --recurse-submodules
    cd augmint-web
    yarn install
    cd augmint-contracts
    yarn install
    ```

## Launch

### 1. Update to latest augmint-web

```
git pull
yarn install # if there were any node package changes in packages.json
```

### 2. Update to latest augmint contract

```
cd augmint-contracts
git checkout master
git pull
yarn install # if there were any node package changes in packages.json
```

### 3. Launch

#### 3.1 Start ganache-cli (formerly testrpc)

`yarn contracts:runmigrate`  
or  
`yarn ganache:run` and in separate console:  
`yarn contracts:migrate`

NB: if you have connection error on the UI then likely `src/contractsBuild` is not up to date: restart ganache and run `yarn contracts:migratecopy`  
Make sure you don't check in changes in `src/contractsBuild` folder (rather raise an issue so we can fix it)

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

* Start interactive: `yarn cypress:open`
* Start command line: `yarn cypress:run`

## Non ganache launches/deploys

See [augmint-contracts repo](https://github.com/Augmint/augmint-contracts)
