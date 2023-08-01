// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
contract Funder {
    mapping(address=>uint) private funders;

    receive() external payable {}

    function transfer() external payable {
        funders[msg.sender]++;
    }

    function withdraw(uint256 withdrawAmount)  external  {
        require(funders[msg.sender]>0,"You havent invested in bank");
        require(address(this).balance>=2000000000000000000,"We dont have enough balance to pay you");
        require(
            withdrawAmount <= 2000000000000000000,
            "Cannot withdraw more than 2 ether"
        );
        payable(msg.sender).transfer(withdrawAmount);
        funders[msg.sender]--;
    }
}