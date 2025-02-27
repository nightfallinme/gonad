// SPDX-License-Identifier: MIT
pragma solidity =0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBattleMessages.sol";

contract GladiatorArena is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant FIGHT_COOLDOWN = 30;       // 30 seconds
    uint256 public constant FIGHT_FEE = 5 ether;       // 5 GONAD
    uint256 public constant WIN_STREAK_BONUS = 1 ether; // 1 GONAD bonus every 3 wins
    uint256 public constant BATTLE_CRY_BONUS = 1 ether; // 1 GONAD bonus for epic battle cry
    uint40 public constant XP_PER_FIGHT = 10;
    uint40 public constant XP_PER_WIN = 25;
    uint40 public constant XP_PER_LEVEL = 100;
    uint40 public constant STAT_POINTS_PER_LEVEL = 5;
    uint40 public constant MAX_STAT_VALUE = 100;
    uint40 public constant MIN_STAT_VALUE = 10;

    // State variables
    IERC20 public gonadToken;
    bool private initialized;
    bool private _locked;
    
    mapping(address => Gladiator) public gladiators;
    mapping(address => uint256) public totalEarnings;
    mapping(uint256 => BattleLog) public battleLogs;
    uint256 public totalBattles;
    uint256 private nonce;

    // Tüm gladyatörleri takip etmek için yeni değişkenler
    address[] public allGladiators;
    uint256 public totalGladiators;
    mapping(address => bool) public isGladiator;

    // Kripto temalı savaş narası bonusları için mapping
    mapping(string => uint256) private battleCryBonuses;

    // BattleMessages kontratı için interface
    IBattleMessages public immutable battleMessages;

    // Gladiator structure
    struct Gladiator {
        string name;           
        uint40 strength;      
        uint40 agility;       
        uint40 vitality;      
        uint40 intelligence;  
        uint40 defense;       
        uint40 experience;    
        uint40 level;         
        uint40 wins;          
        uint40 losses;        
        uint40 lastFight;     
        string battleCry;     
        uint40 winStreak;     
    }

    // Battle log structure
    struct BattleLog {
        address winner;
        address loser;
        uint40 timestamp;
        string epicMoment;    
        IBattleMessages.Rarity rarity;
    }

    // Leaderboard kategorileri için enum
    enum LeaderboardType {
        MOST_WINS,      // En çok galibiyet
        HIGHEST_STREAK, // En yüksek galibiyet serisi
        MOST_EARNINGS,  // En çok GONAD kazanan
        MOST_EFFICIENT  // En iyi kazanç/dövüş oranı
    }

    struct LeaderboardEntry {
        address gladiator;
        string name;
        uint40 wins;
        uint40 losses;
        uint40 winStreak;
        uint40 level;
        uint256 earnings;
        uint256 totalFights;    // Toplam dövüş sayısı
        uint256 efficiency;     // Kazanç/dövüş oranı
    }

    // Mevcut kodun üzerine eklenecek yeni struct ve değişkenler
    struct FightEntry {
        address opponent;
        uint40 timestamp;
        bool won;
    }

    // Her gladyatör için son 10 fight'ı saklayacak mapping
    mapping(address => FightEntry[10]) private recentFights;
    mapping(address => uint256) private fightHistoryCount;

    // Events
    event GladiatorCreated(address indexed owner, string name, string battleCry);
    event BattleResult(
        address indexed winner,
        address indexed loser,
        string epicMoment,
        uint256 reward,
        uint256 battleId,
        IBattleMessages.Rarity rarity
    );
    event GladiatorLevelUp(address indexed gladiator, uint40 newLevel);
    event StatsAllocated(address indexed gladiator, uint40 strength, uint40 agility, uint40 defense);
    event GladiatorKilled(address indexed owner, string name, uint40 wins, uint40 losses);
    event BattleRequested(uint256 indexed requestId, address indexed challenger, address indexed opponent);

    constructor(address _battleMessages) Ownable(msg.sender) {
        battleMessages = IBattleMessages(_battleMessages);

        // Kripto temalı savaş narası bonuslarını ayarla
        battleCryBonuses["WAGMI"] = 12;  // %15 güç bonusu
        battleCryBonuses["NGMI"] = 10;   // %10 güç bonusu
        battleCryBonuses["MONAD"] = 18;  // %25 güç bonusu (maksimum)
        battleCryBonuses["GONAD"] = 15;  // %25 güç bonusu (maksimum)
        battleCryBonuses["GG"] = 5;      // %5 güç bonusu
        battleCryBonuses["APE"] = 8;    // %15 güç bonusu
        battleCryBonuses["HODL"] = 10;   // %15 güç bonusu
        battleCryBonuses["MOON"] = 10;   // %10 güç bonusu
        battleCryBonuses["SER"] = 5;     // %5 güç bonusu
        battleCryBonuses["CHAD"] = 8;   // %20 güç bonusu
    }
    
    function initialize(address _gonadToken) external onlyOwner {
        require(!initialized, "Already initialized");
        require(_gonadToken != address(0), "Invalid token address");
        
        gonadToken = IERC20(_gonadToken);
        initialized = true;
    }
    
    // Modifiers
    modifier onlyInitialized() {
        require(initialized, "Not initialized");
        _;
    }

    modifier hasGladiator() {
        require(gladiators[msg.sender].level > 0, "Create a gladiator first");
        _;
    }

    modifier onCooldown(uint256 lastAction) {
        require(block.timestamp >= lastAction + FIGHT_COOLDOWN, "Action on cooldown");
        _;
    }

    modifier noReentrant() {
        require(!_locked, "No reentrancy");
        _locked = true;
        _;
        _locked = false;
    }
    
    // Core functions
    function createGladiator(
        string memory _name,
        string memory _battleCry
    ) external onlyInitialized {
        require(gladiators[msg.sender].level == 0, "Already has gladiator");
        require(bytes(_name).length > 0 && bytes(_name).length <= 32, "Invalid name length");
        require(bytes(_battleCry).length > 0 && bytes(_battleCry).length <= 100, "Invalid battle cry length");
        
        // Rastgele statlar oluştur
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _name,
            _battleCry
        )));
        
        // Güvenli stat hesaplamaları
        uint256 strength = (randomness % 90) + 10;
        randomness = uint256(keccak256(abi.encodePacked(randomness, "str")));
        
        uint256 agility = (randomness % 90) + 10;
        randomness = uint256(keccak256(abi.encodePacked(randomness, "agi")));
        
        uint256 vitality = (randomness % 90) + 10;
        randomness = uint256(keccak256(abi.encodePacked(randomness, "vit")));
        
        uint256 intelligence = (randomness % 90) + 10;
        randomness = uint256(keccak256(abi.encodePacked(randomness, "int")));
        
        uint256 defense = (randomness % 90) + 10;
        
        // Güvenli normalizasyon
        uint256 total = strength + agility + vitality + intelligence + defense;
        require(total > 0, "Invalid total stats");

        // SafeMath kullanarak normalizasyon
        strength = (strength * 100) / total;
        agility = (agility * 100) / total;
        vitality = (vitality * 100) / total;
        intelligence = (intelligence * 100) / total;
        defense = 100 - strength - agility - vitality - intelligence;

        // Güvenlik kontrolleri
        require(strength <= MAX_STAT_VALUE, "Strength overflow");
        require(agility <= MAX_STAT_VALUE, "Agility overflow");
        require(vitality <= MAX_STAT_VALUE, "Vitality overflow");
        require(intelligence <= MAX_STAT_VALUE, "Intelligence overflow");
        require(defense <= MAX_STAT_VALUE, "Defense overflow");
        
        gladiators[msg.sender] = Gladiator({
            name: _name,
            strength: uint40(strength),
            agility: uint40(agility),
            vitality: uint40(vitality),
            intelligence: uint40(intelligence),
            defense: uint40(defense),
            experience: 0,
            level: 1,
            wins: 0,
            losses: 0,
            lastFight: 0,
            battleCry: _battleCry,
            winStreak: 0
        });
        
        // Yeni gladyatörü listeye ekle
        if (!isGladiator[msg.sender]) {
            allGladiators.push(msg.sender);
            isGladiator[msg.sender] = true;
            totalGladiators++;
        }
        
        emit GladiatorCreated(msg.sender, _name, _battleCry);
    }
    
    function fight(address _opponent) external 
        onlyInitialized 
        hasGladiator 
        onCooldown(gladiators[msg.sender].lastFight)
        noReentrant 
    {
        require(_opponent != msg.sender, "Cannot fight yourself");
        require(gladiators[_opponent].level > 0, "Opponent does not exist");
        
        Gladiator storage glad1 = gladiators[msg.sender];
        Gladiator storage glad2 = gladiators[_opponent];
        
        // Fight fee için allowance kontrolü
        require(
            gonadToken.allowance(msg.sender, address(this)) >= FIGHT_FEE,
            "Insufficient fight fee allowance"
        );
        
        // Fight fee al
        require(gonadToken.transferFrom(msg.sender, address(this), FIGHT_FEE), "Fee transfer failed");

        // Rastgelelik için nonce kullan
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _opponent,
            nonce++
        )));

        // Yeni power ve win chance hesaplama
        (uint256 power1, uint256 winChance1) = calculatePower(glad1, glad2, randomness);
        (uint256 power2, ) = calculatePower(glad2, glad1, randomness);

        // Savaş narası bonuslarını uygula
        power1 = applyBattleCryBonus(power1, glad1.battleCry);
        power2 = applyBattleCryBonus(power2, glad2.battleCry);
        
        // Son rastgele kontrol
        uint256 fightRandomness = uint256(keccak256(abi.encodePacked(randomness, "fight"))) % 100;
        
        address winner;
        if (fightRandomness < winChance1) {
            winner = msg.sender;
            
            glad1.wins++;
            glad1.winStreak++;
            glad1.experience = glad1.experience + XP_PER_FIGHT + XP_PER_WIN;
            
            glad2.losses++;
            glad2.winStreak = 0;
            glad2.experience = glad2.experience + XP_PER_FIGHT;
            
            if(glad1.winStreak % 3 == 0) {
                power1 += WIN_STREAK_BONUS;
            }

            // Eğer savaş narası bonusu varsa ekstra ödül
            if(battleCryBonuses[_toUpperCase(glad1.battleCry)] > 0) {
                power1 += BATTLE_CRY_BONUS;
            }

            // Yeni eklenen kısımlar
            _addFightHistory(msg.sender, _opponent, true);
            _addFightHistory(_opponent, msg.sender, false);

            // Güvenli ceza hesaplaması
            power1 = _calculateTotalPenalty(
                msg.sender,
                _opponent,
                glad1,
                glad2,
                power1
            );
        } else {
            winner = _opponent;
            
            glad2.wins++;
            glad2.winStreak++;
            glad1.losses++;
            glad1.winStreak = 0;
            
            if(glad2.winStreak % 3 == 0) {
                power2 += WIN_STREAK_BONUS;
            }

            // Eğer savaş narası bonusu varsa ekstra ödül
            if(battleCryBonuses[_toUpperCase(glad2.battleCry)] > 0) {
                power2 += BATTLE_CRY_BONUS;
            }

            // Yeni eklenen kısımlar
            _addFightHistory(msg.sender, _opponent, false);
            _addFightHistory(_opponent, msg.sender, true);

            // Güvenli ceza hesaplaması
            power2 = _calculateTotalPenalty(
                _opponent,
                msg.sender,
                glad2,
                glad1,
                power2
            );
        }

        // Level up kontrolü
        _checkLevelUp(glad1);
        _checkLevelUp(glad2);

        // Transfer reward
        require(gonadToken.transfer(winner, power1 > power2 ? power1 : power2), "Reward transfer failed");
        totalEarnings[winner] += power1 > power2 ? power1 : power2;

       // Record battle
        (string memory message, IBattleMessages.Rarity rarity) = battleMessages.getRandomBattleMessage(glad1.name, glad2.name);
        battleLogs[totalBattles] = BattleLog({
            winner: winner,
            loser: winner == msg.sender ? _opponent : msg.sender,
            timestamp: uint40(block.timestamp),
            epicMoment: message,
            rarity: rarity
        });

        emit BattleResult(
            winner,
            winner == msg.sender ? _opponent : msg.sender,
            message,
            power1 > power2 ? power1 : power2,
            totalBattles++,
            rarity
        );

        glad1.lastFight = uint40(block.timestamp);
    }

    function calculatePower(
        Gladiator memory glad1,
        Gladiator memory glad2,
        uint256 randomness
    ) internal pure returns (uint256 power, uint256 winChance) {
        unchecked {
            // Base power hesaplama
            uint256 basePower = 
                glad1.strength * 3 + 
                glad1.agility * 2 + 
                glad1.vitality * 2 + 
                glad1.intelligence * 2 + 
                glad1.defense * 3;
            
            // Stat avantajları için güvenli hesaplama
            uint256 statAdvantageScore = 0;
            uint256 totalStats = glad1.strength + glad1.agility + 
                                  glad1.vitality + glad1.intelligence + 
                                  glad1.defense;
            
            // Her stat karşılaştırması için güvenli kontrol
            if (glad1.strength > glad2.agility && glad1.strength - glad2.agility <= totalStats) {
                statAdvantageScore += (glad1.strength - glad2.agility) * 2;
            }
            
            if (glad1.strength > glad2.defense && glad1.strength - glad2.defense <= totalStats) {
                statAdvantageScore += (glad1.strength - glad2.defense) * 2;
            }
            
            // Diğer stat karşılaştırmaları için benzer kontroller...

            // Rastgelelik faktörü (±10%)
            uint256 randomFactor = (randomness % 21) + 90; // 90-110 range
            
            // Güvenli çarpma
            if (basePower > type(uint256).max / randomFactor) {
                basePower = type(uint256).max;
            } else {
                basePower = (basePower * randomFactor) / 100;
            }

            // Win Chance Hesaplama
            uint256 maxStatAdvantageImpact = 30; // %30 max etki
            
            // Stat avantajını normalize et (taşma kontrolü)
            uint256 normalizedStatAdvantage = totalStats > 0 
                ? (statAdvantageScore * maxStatAdvantageImpact) / totalStats 
                : 0;
            
            // Base win chance: %50
            // Stat advantage ile %20-%80 arasında değişebilir
            winChance = 50 + normalizedStatAdvantage;
            
            // Kesin sınırları koru
            winChance = winChance > 80 ? 80 : (winChance < 20 ? 20 : winChance);
            
            return (basePower, winChance);
        }
    }

    function _checkLevelUp(Gladiator storage glad) private {
        uint40 requiredXP = XP_PER_LEVEL * glad.level;
        while(glad.experience >= requiredXP) {
            glad.level++;
            emit GladiatorLevelUp(msg.sender, glad.level);
            requiredXP = XP_PER_LEVEL * glad.level;
        }
    }

    function allocateStatPoints(
        uint40 _strength,
        uint40 _agility,
        uint40 _vitality,
        uint40 _intelligence,
        uint40 _defense
    ) external hasGladiator noReentrant {
        Gladiator storage glad = gladiators[msg.sender];
        
        uint40 availablePoints = (glad.level - 1) * STAT_POINTS_PER_LEVEL;
        uint40 totalPoints = _strength + _agility + _vitality + _intelligence + _defense;
        require(totalPoints <= availablePoints, "Not enough stat points");
        
        // Check max stat values
        require(glad.strength + _strength <= MAX_STAT_VALUE, "Strength too high");
        require(glad.agility + _agility <= MAX_STAT_VALUE, "Agility too high");
        require(glad.vitality + _vitality <= MAX_STAT_VALUE, "Vitality too high");
        require(glad.intelligence + _intelligence <= MAX_STAT_VALUE, "Intelligence too high");
        require(glad.defense + _defense <= MAX_STAT_VALUE, "Defense too high");
        
        glad.strength += _strength;
        glad.agility += _agility;
        glad.vitality += _vitality;
        glad.intelligence += _intelligence;
        glad.defense += _defense;
        
        emit StatsAllocated(msg.sender, _strength, _agility, _defense);
    }

    // View functions
    function getGladiator(address _owner) external view returns (Gladiator memory) {
        return gladiators[_owner];
    }

    function getRecentBattles() external view returns (BattleLog[] memory) {
        uint256 count = totalBattles < 10 ? totalBattles : 10;
        BattleLog[] memory recentBattles = new BattleLog[](count);
        
        for(uint256 i = 0; i < count; i++) {
            recentBattles[i] = battleLogs[totalBattles - 1 - i];
        }
        
        return recentBattles;
    }

    // Leaderboard'u kategori bazlı getir
    function getLeaderboard(
        LeaderboardType leaderboardType
    ) external view returns (LeaderboardEntry[] memory) {
        // Tüm gladyatörleri topla
        uint256 leaderboardCount = 0;
        for(uint256 i = 0; i < totalBattles; i++) {
            if(gladiators[battleLogs[i].winner].level > 0) leaderboardCount++;
            if(gladiators[battleLogs[i].loser].level > 0) leaderboardCount++;
        }
        
        LeaderboardEntry[] memory leaderboardEntries = new LeaderboardEntry[](leaderboardCount);
        uint256 index = 0;
        
        // Gladyatörleri doldur
        for(uint256 i = 0; i < totalBattles; i++) {
            address winner = battleLogs[i].winner;
            address loser = battleLogs[i].loser;
            
            if(gladiators[winner].level > 0) {
                uint256 totalFights = gladiators[winner].wins + gladiators[winner].losses;
                leaderboardEntries[index] = LeaderboardEntry({
                    gladiator: winner,
                    name: gladiators[winner].name,
                    wins: gladiators[winner].wins,
                    losses: gladiators[winner].losses,
                    winStreak: gladiators[winner].winStreak,
                    level: gladiators[winner].level,
                    earnings: totalEarnings[winner],
                    totalFights: totalFights,
                    efficiency: totalFights > 0 ? totalEarnings[winner] / totalFights : 0
                });
                index++;
            }
            
            if(gladiators[loser].level > 0) {
                uint256 totalFights = gladiators[loser].wins + gladiators[loser].losses;
                leaderboardEntries[index] = LeaderboardEntry({
                    gladiator: loser,
                    name: gladiators[loser].name,
                    wins: gladiators[loser].wins,
                    losses: gladiators[loser].losses,
                    winStreak: gladiators[loser].winStreak,
                    level: gladiators[loser].level,
                    earnings: totalEarnings[loser],
                    totalFights: totalFights,
                    efficiency: totalFights > 0 ? totalEarnings[loser] / totalFights : 0
                });
                index++;
            }
        }
        
        // Seçilen kategoriye göre sırala
        for(uint256 i = 0; i < leaderboardEntries.length; i++) {
            for(uint256 j = i + 1; j < leaderboardEntries.length; j++) {
                bool shouldSwap;
                
                if(leaderboardType == LeaderboardType.MOST_WINS) {
                    shouldSwap = leaderboardEntries[j].wins > leaderboardEntries[i].wins;
                }
                else if(leaderboardType == LeaderboardType.HIGHEST_STREAK) {
                    shouldSwap = leaderboardEntries[j].winStreak > leaderboardEntries[i].winStreak;
                }
                else if(leaderboardType == LeaderboardType.MOST_EARNINGS) {
                    shouldSwap = leaderboardEntries[j].earnings > leaderboardEntries[i].earnings;
                }
                else if(leaderboardType == LeaderboardType.MOST_EFFICIENT) {
                    shouldSwap = leaderboardEntries[j].efficiency > leaderboardEntries[i].efficiency;
                }
                
                if(shouldSwap) {
                    LeaderboardEntry memory temp = leaderboardEntries[i];
                    leaderboardEntries[i] = leaderboardEntries[j];
                    leaderboardEntries[j] = temp;
                }
            }
        }
        
        // Top 10'u döndür
        uint256 resultCount = leaderboardEntries.length < 10 ? leaderboardEntries.length : 10;
        LeaderboardEntry[] memory results = new LeaderboardEntry[](resultCount);
        for(uint256 i = 0; i < resultCount; i++) {
            results[i] = leaderboardEntries[i];
        }
        
        return results;
    }

    // Gladyatör öldürme fonksiyonu
    function killGladiator() external hasGladiator {
        Gladiator storage glad = gladiators[msg.sender];
        
        require(
            gonadToken.allowance(msg.sender, address(this)) >= FIGHT_FEE,
            "Insufficient kill fee allowance"
        );
        
        require(gonadToken.transferFrom(msg.sender, address(this), FIGHT_FEE), "Fee transfer failed");
        
        emit GladiatorKilled(
            msg.sender, 
            glad.name, 
            glad.wins, 
            glad.losses
        );
        
        // Gladyatörü listeden çıkar
        if (isGladiator[msg.sender]) {
            isGladiator[msg.sender] = false;
            totalGladiators--;
            // Not: Array'den çıkarmıyoruz çünkü bu gas maliyetini artırır
            // Onun yerine isGladiator mapping'ini kullanıyoruz
        }
        
        glad.level = 0;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = gonadToken.balanceOf(address(this));
        require(gonadToken.transfer(owner(), balance), "Transfer failed");
    }

    // Savaş narası bonusunu uygula
    function applyBattleCryBonus(uint256 power, string memory battleCry) internal view returns (uint256) {
        uint256 bonus = battleCryBonuses[_toUpperCase(battleCry)];
        if(bonus > 0) {
            // Bonusu maksimum %25 ile sınırla
            bonus = bonus > 25 ? 25 : bonus;
            return power + (power * bonus) / 100; // Yüzdelik bonus uygula
        }
        return power;
    }

    // String'i büyük harfe çevir (sadece basit ASCII için)
    function _toUpperCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bUpper = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // ASCII küçük harf aralığı kontrolü
            if ((uint8(bStr[i]) >= 97) && (uint8(bStr[i]) <= 122)) {
                bUpper[i] = bytes1(uint8(bStr[i]) - 32);
            } else {
                bUpper[i] = bStr[i];
            }
        }
        return string(bUpper);
    }

    // Yeni view fonksiyonları
    function getAllGladiators() external view returns (address[] memory) {
        return allGladiators;
    }

    function getGladiatorsByRange(uint256 start, uint256 end) external view returns (
        address[] memory addresses,
        Gladiator[] memory gladiatorData
    ) {
        require(start < end && end <= totalGladiators, "Invalid range");
        
        uint256 size = end - start;
        addresses = new address[](size);
        gladiatorData = new Gladiator[](size);
        
        for (uint256 i = 0; i < size; i++) {
            addresses[i] = allGladiators[start + i];
            gladiatorData[i] = gladiators[addresses[i]];
        }
        
        return (addresses, gladiatorData);
    }

    // Internal helper fonksiyonlar
    function _addFightHistory(address gladiator, address opponent, bool won) private {
        uint256 index = fightHistoryCount[gladiator] % 10;
        recentFights[gladiator][index] = FightEntry({
            opponent: opponent,
            timestamp: uint40(block.timestamp),
            won: won
        });
        fightHistoryCount[gladiator]++;
    }

    function _calculateOpponentPenalty(address winner, address loser) private view returns (int256) {
        // Son 10 kayıtta aynı rakiple kaç kez karşılaşıldığını say
        uint256 sameOpponentCount = 0;
        for (uint256 i = 0; i < 10; i++) {
            if (recentFights[winner][i].opponent == loser) {
                sameOpponentCount++;
            }
        }

        // Aynı rakiple karşılaşma cezası
        int256 opponentPenalty = 0;
        if (sameOpponentCount == 1) {
            opponentPenalty = -1 ether;  // 1 token düş
        } else if (sameOpponentCount == 2) {
            opponentPenalty = -4 ether;  // 4 token düş
        } else if (sameOpponentCount >= 3) {
            opponentPenalty = -int256(FIGHT_FEE);  // Hiç kazanç yok
        }

        return opponentPenalty;
    }

    function _calculateLevelPenalty(Gladiator memory winnerGlad, Gladiator memory loserGlad) private pure returns (int256) {
        if (winnerGlad.level <= loserGlad.level) return 0;

        uint40 levelDiff = winnerGlad.level - loserGlad.level;
        int256 levelPenalty = 0;

        if (levelDiff == 1) {
            levelPenalty = -1 ether;
        } else if (levelDiff == 2) {
            levelPenalty = -2 ether;
        } else if (levelDiff == 3) {
            levelPenalty = -4 ether;
        }

        return levelPenalty;
    }

    function _calculateTotalPenalty(
        address winner,
        address loser,
        Gladiator memory winnerGlad,
        Gladiator memory loserGlad,
        uint256 baseReward
    ) private view returns (uint256) {
        unchecked {
            // Cezaları hesapla
            int256 opponentPenalty = _calculateOpponentPenalty(winner, loser);
            int256 levelPenalty = _calculateLevelPenalty(winnerGlad, loserGlad);
            
            // Toplam cezayı güvenli hesapla
            int256 totalPenalty = opponentPenalty + levelPenalty;
            
            // Eğer toplam ceza base reward'dan büyükse, 0 döndür
            if (totalPenalty <= -int256(baseReward)) {
                return 0;
            }
            
            // Cezayı uygula ama taşmayı engelle
            uint256 finalReward = baseReward;
            if (totalPenalty < 0) {
                uint256 penaltyAmount = uint256(-totalPenalty);
                
                // Taşma kontrolü
                if (penaltyAmount >= baseReward) {
                    return 0;
                }
                
                finalReward = baseReward - penaltyAmount;
            }
            
            return finalReward;
        }
    }

    function _incrementRandomStat(Gladiator storage glad) private {
        uint256 attempts = 0;
        bool statIncreased = false;

        while (!statIncreased && attempts < 10) {  // Daha fazla deneme şansı
            // Rastgele stat seçimi
            uint256 statIndex = uint256(keccak256(abi.encodePacked(
                block.timestamp, 
                msg.sender, 
                attempts
            ))) % 5;

            // Her stat için kontrol ve artırım
            if (statIndex == 0 && glad.strength < MAX_STAT_VALUE) {
                glad.strength++;
                statIncreased = true;
            } else if (statIndex == 1 && glad.agility < MAX_STAT_VALUE) {
                glad.agility++;
                statIncreased = true;
            } else if (statIndex == 2 && glad.vitality < MAX_STAT_VALUE) {
                glad.vitality++;
                statIncreased = true;
            } else if (statIndex == 3 && glad.intelligence < MAX_STAT_VALUE) {
                glad.intelligence++;
                statIncreased = true;
            } else if (statIndex == 4 && glad.defense < MAX_STAT_VALUE) {
                glad.defense++;
                statIncreased = true;
            }

            attempts++;
        }

        // Eğer 10 denemede de stat artırılamadıysa
        if (!statIncreased) {
            // Tüm statlar max değerdeyse hiçbir şey yapma
            if (glad.strength == MAX_STAT_VALUE && 
                glad.agility == MAX_STAT_VALUE && 
                glad.vitality == MAX_STAT_VALUE && 
                glad.intelligence == MAX_STAT_VALUE && 
                glad.defense == MAX_STAT_VALUE) {
                return;
            }

            // Manuel olarak ilk boş stat'ı bul ve artır
            if (glad.strength < MAX_STAT_VALUE) glad.strength++;
            else if (glad.agility < MAX_STAT_VALUE) glad.agility++;
            else if (glad.vitality < MAX_STAT_VALUE) glad.vitality++;
            else if (glad.intelligence < MAX_STAT_VALUE) glad.intelligence++;
            else if (glad.defense < MAX_STAT_VALUE) glad.defense++;
        }
    }
} 