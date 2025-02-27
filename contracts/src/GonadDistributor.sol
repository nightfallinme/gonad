// SPDX-License-Identifier: MIT
pragma solidity =0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GonadDistributor is Ownable, ReentrancyGuard, Pausable {
    // Constants
    uint256 public constant PRESALE_ALLOCATION = 20_826_000 * 10**18;  // %30 Presale
    uint256 public constant AIRDROP_ALLOCATION = 6_942_000 * 10**18;   // %10 Airdrop
    uint256 public constant MIN_PRESALE_AMOUNT = 1 ether;       // Min 1 GONAD
    uint256 public constant MAX_PRESALE_AMOUNT = 50 ether;     // Max 50 GONAD
    uint256 public constant AIRDROP_AMOUNT = 10 ether;          // 10 GONAD per claim
    uint256 public constant PRESALE_RATE = 10;                  // 10 GONAD per 1 ETH
    uint256 public constant MAX_PRESALE_PER_USER = 1000 ether;  // Max 1000 GONAD per user
    
    // State variables
    IERC20 public immutable gonadToken;
    bool public presaleActive;
    bool public airdropActive;
    bool private initialized;
    bool private _locked;
    uint256 public totalPresaleClaimed;
    uint256 public totalAirdropClaimed;
    mapping(address => bool) public hasClaimedAirdrop;
    mapping(address => uint256) public presaleClaims;
    
    // Events
    event PresaleStarted();
    event AirdropStarted();
    event TokensClaimed(address indexed user, uint256 amount, ClaimType claimType);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    event ETHWithdrawn(address indexed to, uint256 amount);

    // Enums
    enum ClaimType { PRESALE, AIRDROP }
    
    constructor(address _gonadToken) Ownable(msg.sender) {
        require(_gonadToken != address(0), "Invalid token address");
        gonadToken = IERC20(_gonadToken);
    }

    // Modifiers
    modifier onlyInitialized() {
        require(initialized, "Not initialized");
        _;
    }

    modifier noReentrant() {
        require(!_locked, "No reentrancy");
        _locked = true;
        _;
        _locked = false;
    }
    
    // Admin functions
    function startPresale() external onlyOwner {
        require(!presaleActive, "Presale already started");
        presaleActive = true;
        initialized = true;
        emit PresaleStarted();
    }
    
    function startAirdrop() external onlyOwner {
        require(!airdropActive, "Airdrop already started");
        airdropActive = true;
        initialized = true;
        emit AirdropStarted();
    }
    
    // User functions
    function claimPresale(uint256 amount) external payable whenNotPaused noReentrant {
        require(presaleActive, "Presale not active");
        require(amount >= MIN_PRESALE_AMOUNT, "Below minimum amount");
        require(amount <= MAX_PRESALE_AMOUNT, "Exceeds maximum amount");
        require(msg.value * PRESALE_RATE == amount, "Invalid ETH amount");
        require(totalPresaleClaimed + amount <= PRESALE_ALLOCATION, "Exceeds allocation");
        require(presaleClaims[msg.sender] + amount <= MAX_PRESALE_PER_USER, "Exceeds user limit");
        
        presaleClaims[msg.sender] += amount;
        totalPresaleClaimed += amount;
        
        require(gonadToken.transfer(msg.sender, amount), "Transfer failed");
        emit TokensClaimed(msg.sender, amount, ClaimType.PRESALE);
    }
    
    function claimAirdrop() external whenNotPaused noReentrant {
        require(airdropActive, "Airdrop not active");
        require(!hasClaimedAirdrop[msg.sender], "Already claimed");
        require(totalAirdropClaimed + AIRDROP_AMOUNT <= AIRDROP_ALLOCATION, "Exceeds allocation");
        
        hasClaimedAirdrop[msg.sender] = true;
        totalAirdropClaimed += AIRDROP_AMOUNT;
        
        require(gonadToken.transfer(msg.sender, AIRDROP_AMOUNT), "Transfer failed");
        emit TokensClaimed(msg.sender, AIRDROP_AMOUNT, ClaimType.AIRDROP);
    }
    
    // View functions
    function getPresaleInfo() external view returns (
        bool isActive,
        uint256 totalClaimed,
        uint256 remaining,
        uint256 userClaimed,
        uint256 userRemaining
    ) {
        return (
            presaleActive,
            totalPresaleClaimed,
            PRESALE_ALLOCATION - totalPresaleClaimed,
            presaleClaims[msg.sender],
            MAX_PRESALE_PER_USER - presaleClaims[msg.sender]
        );
    }
    
    function getAirdropInfo() external view returns (
        bool isActive,
        uint256 totalClaimed,
        uint256 remaining,
        bool hasClaimed
    ) {
        return (
            airdropActive,
            totalAirdropClaimed,
            AIRDROP_ALLOCATION - totalAirdropClaimed,
            hasClaimedAirdrop[msg.sender]
        );
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawETH() external onlyOwner noReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
        emit ETHWithdrawn(owner(), balance);
    }
    
    function withdrawTokens(uint256 amount) external onlyOwner noReentrant {
        require(amount > 0, "Invalid amount");
        uint256 balance = gonadToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        require(gonadToken.transfer(owner(), amount), "Transfer failed");
        emit EmergencyWithdraw(owner(), amount);
    }

    // Prevent accidental ETH transfers
    receive() external payable {
        require(presaleActive, "Only accept ETH during presale");
    }

    fallback() external payable {
        revert("Function not found");
    }
} 