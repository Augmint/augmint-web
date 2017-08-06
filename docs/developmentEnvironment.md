# UCD development environment
## Install
### OSX
Note: these steps are likely to work on linux too but it's not tested yet
1. [Git](https://git-scm.com/download)
1. [Ethereum CLI](https://www.ethereum.org/cli)
1. [nodejs](https://nodejs.org/en/download/)
1. [node version manager](https://github.com/tj/n): `npm install -g n`  
1. Install node: `n 8.2.1`
1. `npm install -g ethereumjs-testrpc`
1. `npm install -g truffle`
1. `git clone https://github.com/DecentLabs/ucd-poc.git`
1. `cd ucd-poc`
1. `npm install`

### Windows
1. [Windows PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/installing-windows-powershell?view=powershell-6) or [Git Bash](https://git-for-windows.github.io/) (required for truffle)
1. [Git](https://git-scm.com/download) (if you haven't installed it as part of Git Bash in previous step)
1. [Ethereum CLI](https://www.ethereum.org/cli)
1. [Node Version Manager(NVM)](https://github.com/coreybutler/nvm-windows/releases)
1. `nvm install 8.2.1`
1. `npm install -g ethereumjs-testrpc`
1. `npm install -g truffle`
1. `git clone https://github.com/DecentLabs/ucd-poc.git`
1. `cd ucd-poc`
1. `npm install`

TODO: test install steps with [Chocolatey](https://chocolatey.org/)

## Launch
### On testrpc

1. `git pull` for latest ucd-poc version
1. Launch testrpc in separate terminal window:  
   1. `nvm use 8.2.1`
   1. `./runtestrpc` on windows: `runtestrpc.bat`
1. `tuffle migrate` to overwrite existing migration: `truffle migrate --reset`
1. `cp ./build/contracts/* ./src/contractsBuild` (TODO: see [truffle-migrate issue #10](https://github.com/trufflesuite/truffle-migrate/issues/10) )
1. `yarn start`

### On testnet
TODO: not tested yet
