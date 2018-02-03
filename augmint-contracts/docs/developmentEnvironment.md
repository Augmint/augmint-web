# Augmint PoC development environment

## Install

<span style="color:red">**Instructions are outdated** because of a recent repo restructuring. Update coming soon.</span>

### OSX

Note: these steps are likely to work on linux too but it's not tested yet

1. [Git](https://git-scm.com/download)
1. [Ethereum CLI](https://www.ethereum.org/cli)
1. [nodejs](https://nodejs.org/en/download/) v8.5.0  
   _use version 8.5.0, ganache regularly crashes with newer version (FE also works with 8.9.4)_
1. `npm install -g truffle@4.0.6`
1. `git clone https://github.com/Augmint/augmint-core.git`
1. `cd augmint-core`
1. `npm install`

### Windows

_Note: windows install was not tested since a while, update on it is welcome_

1. [Git Bash](https://git-for-windows.github.io/) (required for truffle & yarn start)
1. [Git](https://git-scm.com/download) (if you haven't installed it as part of Git Bash in previous step)
1. [Ethereum CLI](https://www.ethereum.org/cli) - including development tools
1. [Node Version Manager(NVM)](https://github.com/coreybutler/nvm-windows/releases)

in Git bash:

1. `nvm install 8.5.0`
1. `nvm use 8.5.0`
1. `npm install -g truffle@4.0.6`
1. `git clone https://github.com/Augmint/augmint-core.git`
1. `cd augmint-core`
1. `npm install`

## Launch

### 1. Update to latest augmint-core

1. `git pull` for latest augmint-core version
1. `npm install` if there were any node package changes in packages.json

### 2. Deploy to network

#### ganache-cli (formerly testrpc)

1. `npm run ganache:runmigrate`  
   or
    * `./runganache.sh` (windows: `./runganache.bat`)
    * in separate console:  
      `truffle migrate` or  
      `truffle migrate --reset` to overwrite existing migration
1. `cp ./build/contracts/* ./src/contractsBuild`  
   _TODO: this step is needed b/c of a [truffle-migrate issue](https://github.com/trufflesuite/truffle-migrate/issues/10)_

### 3. Launch local dev server

`yarn start`

_NB: If you are using Metamask on local chain and you restart the local chain then your consecutive transactions will fail with [`Invalid nonce` error](https://github.com/MetaMask/metamask-extension/issues/1999). You will need to [reset your account in Metamask](http://metamask.helpscoutdocs.com/article/36-resetting-an-account)._

## UI development

UI is built with [semantic-ui](https://www.semantic-ui.com) and [semantic-ui-react](https://react.semantic-ui.com).

_NB: we are getting transitioning from semantic-ui_

To customize it you need to edit dcm theme in [src/semantic/themes/dcm](src/semantic/themes/dcm) folder.

### css build

```
cd src/semantic
gulp build-css
gulp build-assets
```

You can also use `gulp watch`

## Tests

### Contracts

`truffle test`

### FrontEnd - E2E

_Note: Frontend tests are experimental and unfinished yet. Also ganache crashes time-to-time_

* Start interactive: `npm run cypress:open`
* Start command line: `npm run cypress:run`

## Non ganache launches/deploys

### Private chain

#### First init

```
cd privatechain
./createprivatechain.sh
cd ..
truffle migrate
cp ./build/contracts/* ./src/contractsBuild
```

#### Launch

```
cd privatechain
./runprivatechain.sh
```

#### Reset privatechain

```
cd privatechain
rm -r chaindata/geth
./createprivatechain.sh
cd ..
truffle migrate  --network privatechain
cp ./build/contracts/* ./src/contractsBuild
```

### Rinkeby

```
./runrinkeby.sh
truffle migrate --network rinkeby
cp ./build/contracts/* ./src/contractsBuild
```

_NB: truffle migrate works with geth stable 1.7.2 only. Follow [this issue](https://github.com/trufflesuite/truffle/issues/721)._

### WIP (ignore it) alternative ganache launches

#### Alternatively: Ganache UI

If you use [ganache UI](http://truffleframework.com/ganache/) then

* set the port to 8545
* For running UI tests set mnemonic:  
  `hello build tongue rack parade express shine salute glare rate spice stock`

#### Alternatively: truffle develop

_note: truffle runs local chain on localhost:9545_

1. `truffle develop`
1. in truffle console:  
   `migrate` or  
   `migrate --reset` to overwrite existing migration
1. `cp ./build/contracts/* ./src/contractsBuild` (TODO: this step is needed b/c of a [truffle-migrate issue #10](https://github.com/trufflesuite/truffle-migrate/issues/10) )

_TODO: use same mnemonic & port as `runganache.sh`_
