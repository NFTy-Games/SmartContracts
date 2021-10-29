pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./abstract/EmergencyWithdrawable.sol";

contract TradeStand is ERC721Enumerable, ERC721URIStorage, Ownable, EmergencyRecover {
    using Counters for Counters.Counter;

    // The token URI must be the full URI in this contract.
    string constant baseUri = "";

    Counters.Counter public _tokenIdCounter;

    constructor() ERC721("Polymon World Trade Stand", "TRADE") {}

    //++++++++
    // Public functions
    //++++++++

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            for (uint256 index; index < tokenCount; index++) {
                result[index] = tokenOfOwnerByIndex(owner, index);
            }
            return result;
        }
    }

    //++++++++
    // Owner functions
    //++++++++

    function mint(string calldata metaFileURI) public onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, metaFileURI);

        return newItemId;
    }

    function setTokenURI(uint256 itemId, string calldata metaFileURI) public onlyOwner {
        _setTokenURI(itemId, metaFileURI);
    }

    //++++++++
    // Explicit overrides
    //++++++++

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage, ERC721) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC721) returns (bool) {
        return interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }
}
