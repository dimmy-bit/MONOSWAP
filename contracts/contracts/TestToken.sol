// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    uint8 private _decimals;
    bool public mintingEnabled = true;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue
    ) ERC20(name, symbol) {
        _decimals = decimalsValue;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        require(mintingEnabled, "Minting is disabled");
        _mint(to, amount);
    }

    // Owner can disable minting if needed
    function setMintingEnabled(bool enabled) public onlyOwner {
        mintingEnabled = enabled;
    }
} 