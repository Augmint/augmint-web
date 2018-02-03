while read p; do
  geth --datadir=./chaindata/ account import <(echo "$p") --password <(echo "1234")
done < privatekeys
