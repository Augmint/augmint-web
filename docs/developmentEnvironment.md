# UCD development environment
## Install
### OSX
Note: these steps are likely to work on linux too but it's not tested yet
1. [Git](https://git-scm.com/download)
1. [Ethereum CLI](https://www.ethereum.org/cli)
1. [nodejs](https://nodejs.org/en/download/) (tested with 8.4.0)
1. [node version manager](https://github.com/tj/n): `npm install -g n`  
1. Install node: `n 8.4.0`
1. `npm install -g ethereumjs-testrpc`  
  _latest 4.1.1 version required_
1. `npm install -g truffle`
1. `git clone https://github.com/DecentLabs/ucd-poc.git`
1. `cd ucd-poc`
1. `npm install`

### Windows
1. [Git Bash](https://git-for-windows.github.io/) (required for truffle & yarn start)
1. [Git](https://git-scm.com/download) (if you haven't installed it as part of Git Bash in previous step)
1. [Ethereum CLI](https://www.ethereum.org/cli) - including development tools
1. [Node Version Manager(NVM)](https://github.com/coreybutler/nvm-windows/releases)

in Git bash:
1. `nvm install 8.4.0`
1. `nvm use 8.4.0`
1. `npm install -g ethereumjs-testrpc`  
    _latest 4.1.0 version required_
1. `npm install -g truffle`
1. `git clone https://github.com/DecentLabs/ucd-poc.git`
1. `cd ucd-poc`
1. `npm install`

## Launch
### 1. Update to latest ucd-poc
1. `git pull` for latest ucd-poc version
1. `npm install` if there were any node package changes in packages.json

### 2. Deploy to network
#### Testrpc
1. `./runtestrpc` or on windows: `./runtestrpc.bat`
1. in separate console:  
  `truffle migrate` or  
  `truffle migrate --reset` to overwrite existing migration
1. `cp ./build/contracts/* ./src/contractsBuild` (TODO: this step is needed b/c of a [truffle-migrate issue #10](https://github.com/trufflesuite/truffle-migrate/issues/10) )

#### Private chain
##### First init
```
cd privatechain
./createprivatechain.sh
cd ..
truffle migrate
cp ./build/contracts/* ./src/contractsBuild
```
##### Launch
```
cd privatechain
./runprivatechain.sh
```
##### Reset privatechain
```
cd privatechain
rm -r chaindata/geth
./createprivatechain.sh
cd ..
truffle migrate
cp ./build/contracts/* ./src/contractsBuild
```

#### Rinkeby
```
./runrinkeby.sh
truffle migrate --network rinkeby
cp ./build/contracts/* ./src/contractsBuild
```

### 3. Launch local dev server
`yarn start`

## UI development
UI is built with [semantic-ui](https://www.semantic-ui.com) and [semantic-ui-react](https://react.semantic-ui.com).

To customize it you need to edit dcm theme in [src/semantic/themes/dcm](src/semantic/themes/dcm) folder.

### css build
```
cd src/semantic
gulp build-css
gulp build-assets
```
You can also use `gulp watch`
