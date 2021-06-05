// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    struct Star {
        string name;
    }

    address public contarctAddress;

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    constructor() ERC721("StarItem", "STR") {
        contarctAddress = address(this);
    }

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't owned"
        );
        starsForSale[_tokenId] = _price;
        // address a = 0xc7ecDC1684563d773a10c10115b4699f33a49706;
        // approve(contarctAddress, _tokenId);
        // setApprovalForAll(contarctAddress, true);
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(x);
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];

        address ownerAddress = ownerOf(_tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers

        address senderAddress = msg.sender;
        address payable senderAddressPayable = _make_payable(senderAddress);

        require(msg.value > starCost, "You need to have enough Ether");

        _transfer(ownerAddress, senderAddress, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom

        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            senderAddressPayable.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory, address)
    {
        string memory starName = "no star exist for this token";
        address starOwner;

        if (_exists(_tokenId)) {
            starName = tokenIdToStarInfo[_tokenId].name;
            starOwner = ownerOf(_tokenId);
        }
        return (starName, starOwner);
    }

    function exchangeStars(uint256 _tokenId_user1, uint256 _tokenId_user2)
        public
    {
        require(
            _exists(_tokenId_user1) && _exists(_tokenId_user2),
            "At least one of the stars don't exist"
        );
        require(
            (ownerOf(_tokenId_user1) == msg.sender) ||
                (ownerOf(_tokenId_user2) == msg.sender),
            "You can't exchange what you don't owned"
        );

        address owner_user1 = ownerOf(_tokenId_user1);
        address owner_user2 = ownerOf(_tokenId_user2);

        _transfer(owner_user1, owner_user2, _tokenId_user1);
        _transfer(owner_user2, owner_user1, _tokenId_user2);
    }

    function transferStars(address _to, uint256 _tokenId) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't transfer the Star you don't owned"
        );
        transferFrom(msg.sender, _to, _tokenId);
    }
}
