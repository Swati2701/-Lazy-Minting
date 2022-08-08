//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract LazyMinting is ERC721URIStorage, EIP712, AccessControl {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;

    struct NFTVoucher {
        uint256 tokenId;
        uint256 minPrice;
        string uri;
        address buyer;
    }

    mapping(address => uint256) public totalWithdrawAmount;

    constructor() ERC721("LazyMinting", "LM") EIP712("LazyMinting", "1") {}

    function redeem(NFTVoucher calldata voucher, bytes memory signature)
        external
        payable
        returns (uint256)
    {
        // require(user != address(0), "Called by zero address");
        require(msg.value >= voucher.minPrice, "Insufficient funds");

        _verify(voucher, signature);
        // console.log("=======", voucher.buyer);
        _mint(voucher.buyer, voucher.tokenId);
        // /console.log("--------", msg.sender);
        _transfer(voucher.buyer, msg.sender, voucher.tokenId);
        totalWithdrawAmount[voucher.buyer] += msg.value;
        return voucher.tokenId;
    }

    function _hash(NFTVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTVoucher(uint256 tokenId,uint256 minPrice,string uri)"
                        ),
                        voucher.tokenId,
                        voucher.minPrice,
                        keccak256(bytes(voucher.uri))
                    )
                )
            );
    }

    function _verify(NFTVoucher calldata voucher, bytes memory signature)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return digest.toEthSignedMessageHash().recover(signature);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
