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

TODO: test windows install steps with [Chocolatey](https://chocolatey.org/)

## Launch
### On testrpc

Update to latest ucd-poc:
1. `git pull` for latest ucd-poc version
1. `npm install` if there were any node package changes in packages.json

Launching:
1. `./runtestrpc` or on windows: `./runtestrpc.bat`
1. in separate console:  
  `truffle migrate` or  
  `truffle migrate --reset` to overwrite existing migration
1. `cp ./build/contracts/* ./src/contractsBuild` (TODO: this step is needed b/c of a [truffle-migrate issue #10](https://github.com/trufflesuite/truffle-migrate/issues/10) )
1. `yarn start`

### On testnet
TODO: not tested yet
