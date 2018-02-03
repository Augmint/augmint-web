geth --testnet \
--networkid 3 \
--cache=1024 \
--rpc \
--rpcapi db,eth,net,web3,personal \
--rpccorsdomain="http://localhost:3000" \
--unlock 0
