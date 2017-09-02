geth --datadir=./chaindata/ \
-rpc \
--networkid 1976 \
--unlock "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20" --password passes \
--rpcapi="db,eth,net,web3,personal,miner" \
--rpccorsdomain "*" \
--mine \
--cache=1024
