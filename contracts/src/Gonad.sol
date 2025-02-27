// SPDX-License-Identifier: MIT
pragma solidity =0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Gonad is Ownable, Pausable, ReentrancyGuard {
    // ERC20 temel değişkenleri
    string public constant name = "GONAD Token";
    string public constant symbol = "GONAD";
    uint8 public constant decimals = 18;
    uint256 private _totalSupply;
    
    // Balances ve allowances
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Events (ERC20 standart)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Token Ekonomisi
    uint256 public constant TOTAL_SUPPLY = 69_420_000 * 10**18;  // 69.42M GONAD
    uint256 public constant ARENA_ALLOCATION = 48_594_000 * 10**18;  // %70 Arena için
    uint256 public constant PRESALE_ALLOCATION = 6_942_000 * 10**18;  // %10 Presale
    uint256 public constant AIRDROP_ALLOCATION = 6_942_000 * 10**18;  // %10 Airdrop
    uint256 public constant TEAM_ALLOCATION = 6_942_000 * 10**18;  // %10 Team/Development

    // Kullanıcı limitleri
    uint256 public constant DAILY_FLEX_LIMIT = 42;
    uint256 public constant PRESALE_PRICE = 1 * 10**18;  // 1 MON
    uint256 public constant GONAD_PER_MON = 1000;  // 1 MON = 1000 GONAD
    uint256 public constant MAX_PRESALE_PER_USER = 1000 * 10**18;  // Kişi başı max 1000 GONAD
    uint256 public constant AIRDROP_AMOUNT = 10 * 10**18;  // 10 GONAD airdrop

    // Events
    event FlexFailed(address indexed flexer, string reason);
    event MemePosted(address indexed poster, string message);
    event GigaChad(address indexed chad, uint256 flexPower);
    event Rugpull(address indexed victim, string lastWords);
    event DistributorSet(address indexed distributor);
    event ArenaSet(address indexed arena);
    event TeamAddressSet(address indexed team);
    event EmergencyWithdraw(address indexed to, uint256 amount);

    // State variables
    mapping(address => uint256) public flexCount;
    mapping(address => uint256) public lastFlexTime;
    mapping(address => string) public catchPhrases;
    mapping(address => bool) public hasBeenRugged;
    mapping(address => uint256) public memeCount;
    
    address public arenaAddress;
    address public teamAddress;
    address public distributorAddress;
    bool private distributorInitialized;
    bool private arenaInitialized;
    bool private initialized;
    bool private _locked;

    constructor() Ownable(msg.sender) {
        require(
            ARENA_ALLOCATION + PRESALE_ALLOCATION + AIRDROP_ALLOCATION + TEAM_ALLOCATION == TOTAL_SUPPLY,
            "Invalid token allocation"
        );

        _totalSupply = TOTAL_SUPPLY;
        _balances[msg.sender] = TOTAL_SUPPLY;
        teamAddress = msg.sender;
        catchPhrases[msg.sender] = "I created GONAD, bow before me!";
        emit GigaChad(msg.sender, 9001);
    }

    // Modifiers
    modifier onlyInitialized() {
        require(distributorInitialized && arenaInitialized, "Not initialized");
        _;
    }

    modifier noReentrant() {
        require(!_locked, "No reentrancy");
        _locked = true;
        _;
        _locked = false;
    }

    function initializeDistributor(address _distributor) external onlyOwner {
        require(!distributorInitialized, "Distributor already initialized");
        require(_distributor != address(0), "Invalid distributor address");
        require(distributorAddress == address(0), "Distributor already set");
        
        distributorAddress = _distributor;
        // Presale ve Airdrop tokenlarını owner'dan gönder
        _balances[msg.sender] -= PRESALE_ALLOCATION + AIRDROP_ALLOCATION;
        _balances[_distributor] += PRESALE_ALLOCATION + AIRDROP_ALLOCATION;
        emit DistributorSet(_distributor);
        distributorInitialized = true;
    }

    function initializeArena(address _arena) external onlyOwner {
        require(!arenaInitialized, "Arena already initialized");
        require(_arena != address(0), "Invalid arena address");
        require(arenaAddress == address(0), "Arena already set");
        
        arenaAddress = _arena;
        // Arena tokenlarını owner'dan gönder
        _balances[msg.sender] -= ARENA_ALLOCATION;
        _balances[_arena] += ARENA_ALLOCATION;
        emit ArenaSet(_arena);
        arenaInitialized = true;
    }

    function setTeamAddress(address _team) external onlyOwner {
        require(_team != address(0), "Invalid team address");
        teamAddress = _team;
        emit TeamAddressSet(_team);
    }

    // Owner TMON'ları çekebilir
    function withdrawTMON() external onlyOwner noReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No TMON to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    function sendToArena(address arena, uint256 amount) external onlyOwner {
        require(arena == arenaAddress, "Invalid arena address");
        require(amount > 0, "Invalid amount");
        require(_balances[owner()] >= amount, "Insufficient balance");
        _balances[owner()] -= amount;
        _balances[arena] += amount;
    }
    
    // ERC20 temel fonksiyonları
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public whenNotPaused returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
    
    function _transfer(address from, address to, uint256 amount) internal whenNotPaused {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Invalid amount");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        // %1 şansla rug pull
        if (from != address(this) && uint256(keccak256(abi.encodePacked(block.timestamp, from))) % 100 == 69) {
            hasBeenRugged[from] = true;
            emit Rugpull(from, "Got GONAD'd!");
            unchecked {
                _balances[from] = fromBalance - amount;
                _balances[to] += amount / 2; // Yarısını kaybeder
            }
            emit Transfer(from, to, amount / 2);
            return;
        }
        
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }
    
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");
        
        _totalSupply += amount;
        unchecked {
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);
    }
    
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");
        
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            _totalSupply -= amount;
        }
        
        emit Transfer(account, address(0), amount);
    }

    // Eğlenceli Fonksiyonlar
    function flexOnThem() external whenNotPaused noReentrant {
        require(block.timestamp >= lastFlexTime[msg.sender] + 1 hours, "Bro chill with the flexing");
        require(flexCount[msg.sender] < DAILY_FLEX_LIMIT, "You flexed too much today");
        
        uint256 balance = _balances[msg.sender];
        require(balance > 0, "No GONAD to flex with");
        
        // Random flex power
        uint256 flexPower = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % balance;
        
        if (flexPower < 1000) {
            emit FlexFailed(msg.sender, "Do you even lift bro?");
        } else {
            emit GigaChad(msg.sender, flexPower);
            // Bonus GONAD for epic flex
            _mint(msg.sender, 69 * 10**17);
        }
        
        flexCount[msg.sender]++;
        lastFlexTime[msg.sender] = block.timestamp;
    }
    
    function setCatchPhrase(string memory phrase) external whenNotPaused {
        require(bytes(phrase).length > 0, "Empty phrase");
        require(bytes(phrase).length <= 100, "Too long, keep it short king");
        require(_balances[msg.sender] >= 1000 * 10**18, "Need at least 1000 GONAD to be this based");
        catchPhrases[msg.sender] = phrase;
    }
    
    function postMeme(string memory meme) external {
        require(bytes(meme).length <= 140, "Sir, this is not Twitter");
        require(memeCount[msg.sender] < 69, "You've posted enough cringe");
        
        memeCount[msg.sender]++;
        emit MemePosted(msg.sender, meme);
        
        // %10 şansla bonus GONAD
        if (uint256(keccak256(abi.encodePacked(block.timestamp, meme))) % 10 == 0) {
            _mint(msg.sender, 42 * 10**18);
        }
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner noReentrant {
        uint256 balance = _balances[address(this)];
        require(balance > 0, "No tokens to withdraw");
        _balances[address(this)] = 0;
        _balances[owner()] += balance;
        emit EmergencyWithdraw(owner(), balance);
    }

    // View functions
    function getFlexStatus(address user) external view returns (
        uint256 dailyFlexes,
        uint256 timeUntilNextFlex,
        string memory catchPhrase,
        bool isRugged,
        uint256 memes
    ) {
        uint256 nextFlexTime = lastFlexTime[user] + 1 hours;
        return (
            flexCount[user],
            block.timestamp < nextFlexTime ? nextFlexTime - block.timestamp : 0,
            catchPhrases[user],
            hasBeenRugged[user],
            memeCount[user]
        );
    }
    
    // Easter Egg
    function theSecretOfGONAD() external pure returns (string memory) {
        return "The real GONAD was the friends we made along the way";
    }

    // Fallback ve receive fonksiyonları
    receive() external payable {}
    fallback() external payable {}
} 