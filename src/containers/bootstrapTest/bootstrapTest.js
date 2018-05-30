import React from "react";
import {
    Table,
    Tr,
  } from 'styled-table-component';

  const transactionHistory = [
    {
      to: "0xd83a566e710da5256cd293f00f94709cab519bf5252ad298197bf32a7f68e82e",
      from: "0x2f3ec022a7e947ee50b364ff052c07d5e816900e0e73224e04f7de8faab0ca93",
      dateTime: 1526488945,
      amount: 0.00012,
      description: "lorem"
    },
    {
      to: "0x85b3d743fbe4ec4e2b58947fa5484da7b2f5538b0ae8e655646f94c95d5fb949",
      from: "0x2f3ec022a7e947ee50b364ff052c07d5e816900e0e73224e04f7de8faab0ca93",
      dateTime: 1526483945,
      amount: 0.002,
      description: "ipsum"
    },
    {
      to: "0x34a4a813a9ed02ca86af9687935802fd664f4f67efc5680d7077da70e1d4e5fb",
      from: "0x8cf61dd5ce563454a0e79f621b591a324d725ef1e6887417e2adafad62a1a716",
      dateTime: 1526483935,
      amount: 0.0033,
      description: "dorem"
    },
    {
      to: "0x34a4a813a9ed02ca86af9687935802fd664f4f67efc5680d7077da70e1d4e5fb",
      from: "0x8cf61dd5ce563454a0e79f621b591a324d725ef1e6887417e2adafad62a1a716",
      dateTime: 1526483955,
      amount: 0.013,
      description: "sit"
    }
  
 ];
 

const MyTableComponent = (props) => ( 
    <Table>
        <thead>
            <tr>
                <th scope="col">TO</th>
                <th scope="col">FROM</th>
                <th scope="col">DATE/TIME</th>
                <th scope="col">AMOUNT</th>
                <th scope="col">DESCRIPTION</th>
            </tr>
        </thead>
        <tbody>
            <Tr TRANSACTION>
                <td>{transactionHistory[0].to}</td>
                <td>{transactionHistory[0].from}</td>
                <td>{transactionHistory[0].dateTime}</td>
                <td>{transactionHistory[0].amount}</td>
                <td>{transactionHistory[0].description}</td>
            </Tr>
            <Tr>
                <td>{transactionHistory[1].to}</td>
                <td>{transactionHistory[1].from}</td>
                <td>{transactionHistory[1].dateTime}</td>
                <td>{transactionHistory[1].amount}</td>
                <td>{transactionHistory[1].description}</td>
            </Tr>
            <Tr>
                <td>{transactionHistory[2].to}</td>
                <td>{transactionHistory[2].from}</td>
                <td>{transactionHistory[2].dateTime}</td>
                <td>{transactionHistory[2].amount}</td>
                <td>{transactionHistory[2].description}</td>
            </Tr>
            <Tr>
                <td>{transactionHistory[3].to}</td>
                <td>{transactionHistory[3].from}</td>
                <td>{transactionHistory[3].dateTime}</td>
                <td>{transactionHistory[3].amount}</td>
                <td>{transactionHistory[3].description}</td>
            </Tr>
        </tbody>
    </Table>
);


export default class BootstrapTest extends React.Component {
  
    render() {

        function myHeader () {
            const skeleton =     
            <Table>
                <thead>
                    <tr>
                        <th scope="col">TO</th>
                        <th scope="col">FROM</th>
                        <th scope="col">DATE/TIME</th>
                        <th scope="col">AMOUNT</th>
                        <th scope="col">DESCRIPTION</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </Table>
        return skeleton
    
        }
        
        function transactioner (list) {
            let transactions = [];
            for (var i = 0; i < list.length; i++){
                transactions.push(
                    <Tr>
                        <td>{list[i].to}</td>
                        <td>{list[i].from}</td>
                        <td>{list[i].dateTime}</td>
                        <td>{list[i].amount}</td>
                        <td>{list[i].description}</td>
                    </Tr>   
                )
            }
            console.log(transactions)
            return transactions;
        }

        return MyTableComponent()

    }
}

