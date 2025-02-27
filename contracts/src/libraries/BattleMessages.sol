// SPDX-License-Identifier: MIT
pragma solidity =0.8.28;

contract BattleMessages {
    // Rarity levels for UI
    enum Rarity {
        COMMON,     // weight 15 - Gray/White
        UNCOMMON,   // weight 10 - Green
        RARE,      // weight 8  - Blue
        EPIC,      // weight 5  - Purple
        LEGENDARY, // weight 3  - Orange
        MYTHIC     // weight 2  - Red
    }

    struct Message {
        string text;
        uint256 weight;
        Rarity rarity;
    }

    function getRandomBattleMessage(
        string memory winner, 
        string memory loser
    ) external view returns (string memory message, Rarity rarity) {
        Message[150] memory messages = [
            // Common messages (Gray/White) - weight: 15
            Message(unicode"$WINNER HODLed while $LOSER panic sold! 📈", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'We're all gonna make it!' $LOSER: 'My portfolio...' 💎", 15, Rarity.COMMON),
            Message(unicode"$WINNER proved $LOSER is ngmi! 🎭", 15, Rarity.COMMON),
            Message(unicode"$WINNER diamond handed, $LOSER paper handed! 💎🤲", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'gm' $LOSER: 'gn' 🌅", 15, Rarity.COMMON),
            Message(unicode"$WINNER stayed solvent longer than $LOSER stayed liquid! 💧", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'wagmi' $LOSER: 'ngmi' 🎭", 15, Rarity.COMMON),
            Message(unicode"$WINNER caught $LOSER buying high and selling low! 📉", 15, Rarity.COMMON),
            Message(unicode"$WINNER's TA was better than $LOSER's copium! 📈", 15, Rarity.COMMON),
            Message(unicode"$WINNER was early, $LOSER was wrong! ⏰", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'few understand' $LOSER: 'ser...' 🧠", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'probably nothing' $LOSER: 'definitely something' 👀", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'ser, this is alpha' $LOSER: *gets rekt* 📊", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'wen moon?' $LOSER: 'wen rekt?' 🌕", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'looks rare' $LOSER: 'right click save' 🖼️", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'this is the gwei' $LOSER: *pays 500 gwei* ⛽", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'dyor' $LOSER: *buys $SCAM* 🔍", 15, Rarity.COMMON),
            Message(unicode"$WINNER aped in, $LOSER got dumped on! 🦍", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'ser pls' $LOSER: *gets liquidated* 💦", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'anon, y u do dis?' $LOSER: *gets rekt* 🎭", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'touch grass' $LOSER: *still staring at charts* 🌱", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'ser, we are not the same' $LOSER: *crying in jpeg* 🎭", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'up only' $LOSER: *gets dumped on* 📈", 15, Rarity.COMMON),
            Message(unicode"$WINNER's portfolio: 100x $LOSER's portfolio: -99.9% 💸", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'imagine being poor' $LOSER: *checks wallet* 👀", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'bing bong' $LOSER: 'funds are safu?' 🔔", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'cope + seethe' $LOSER: *overdoses on hopium* 💊", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'skill issue' $LOSER: *buys more shitcoins* 💩", 15, Rarity.COMMON),
            Message(unicode"$WINNER: 'ngmi energy detected' $LOSER: *proves them right* 🔍", 15, Rarity.COMMON),
            Message(unicode"$WINNER's chad wallet vs $LOSER's virgin portfolio 👑", 15, Rarity.COMMON),

            // Uncommon messages (Green) - weight: 10
            Message(unicode"$WINNER yield farmed $LOSER's tears! 🌾", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's LP tokens > $LOSER's shitcoins! 🏊", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER staked high, $LOSER got slashed! ⚔️", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER found $LOSER's honeypot! 🍯", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's wallet > $LOSER's web2 mindset! 👛", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'based' $LOSER: 'cringe' 🎭", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's whitepaper > $LOSER's roadmap! 📄", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's decentralized > $LOSER's centralized! 🌐", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER deployed proxy, $LOSER got upgraded! 🔄", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's multisig > $LOSER's single key! 🔑", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'infinite APY!' $LOSER: *gets IL'd* 💹", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER bridged the gap in $LOSER's strategy! 🌉", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's smart contract > $LOSER's rugpull! 📝", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'fully collateralized' $LOSER: *gets liquidated* 💰", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's MEV bot > $LOSER's market order! 🤖", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'verified contract' $LOSER: *unaudited fork* ✅", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's gas optimization > $LOSER's loops! ⛽", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'ser, check github' $LOSER: 'readme only' 💻", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's floor price > $LOSER's ceiling! 📊", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'not financial advice' $LOSER: *gets rekt anyway* 💸", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's trading bot dumped on $LOSER's market buy! 🤖", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'imagine using CEX' $LOSER: *gets Binanced* 🏦", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's mempool > $LOSER's Internet Explorer trades 🌊", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'nice try IRS' $LOSER: *files taxes* 📝", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's alpha group > $LOSER's discord signals 📱", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'ser, check tokenomics' $LOSER: 'wen moon ser?' 📊", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's cold wallet > $LOSER's hot wallet hack 🔒", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'few' $LOSER: 'many ser, many' 🤔", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER's chad NFT > $LOSER's right click save 🖼️", 10, Rarity.UNCOMMON),
            Message(unicode"$WINNER: 'ngmi detected' $LOSER: *proves thesis* 🎯", 10, Rarity.UNCOMMON),

            // Rare DeFi & NFT memes (Blue) - weight: 8
            Message(unicode"$WINNER's impermanent gain > $LOSER's impermanent loss! 📈", 8, Rarity.RARE),
            Message(unicode"$WINNER's flash loan > $LOSER's margin call! 💫", 8, Rarity.RARE),
            Message(unicode"$WINNER: 'check tokenomics' $LOSER: *buys rebase* 📜", 8, Rarity.RARE),
            Message(unicode"$WINNER's vault strategy > $LOSER's yield farm! 🏦", 8, Rarity.RARE),
            Message(unicode"$WINNER's governance > $LOSER's centralization! 🏛️", 8, Rarity.RARE),
            Message(unicode"$WINNER's alpha leak > $LOSER's beta test! 🔓", 8, Rarity.RARE),
            Message(unicode"$WINNER's airdrop > $LOSER's presale! 🪂", 8, Rarity.RARE),
            Message(unicode"$WINNER's token utility > $LOSER's ponzinomics! 🎮", 8, Rarity.RARE),
            Message(unicode"$WINNER's staking rewards > $LOSER's mining rewards! ⛏️", 8, Rarity.RARE),
            Message(unicode"$WINNER's oracle > $LOSER's price feed! 🔮", 8, Rarity.RARE),
            Message(unicode"$WINNER's 1/1 > $LOSER's 10k PFP! 🎨", 8, Rarity.RARE),
            Message(unicode"$WINNER minted legendary, $LOSER minted common! 🎭", 8, Rarity.RARE),
            Message(unicode"$WINNER's metadata > $LOSER's attributes! 📋", 8, Rarity.RARE),
            Message(unicode"$WINNER's rarity > $LOSER's floor! 💎", 8, Rarity.RARE),
            Message(unicode"$WINNER's community > $LOSER's discord! 🤝", 8, Rarity.RARE),
            Message(unicode"$WINNER's art > $LOSER's derivative! 🎨", 8, Rarity.RARE),
            Message(unicode"$WINNER's utility > $LOSER's jpeg! 🛠️", 8, Rarity.RARE),
            Message(unicode"$WINNER swept floor, $LOSER got swept! 🧹", 8, Rarity.RARE),
            Message(unicode"$WINNER's bluechip > $LOSER's rugpull! 🔷", 8, Rarity.RARE),
            Message(unicode"$WINNER's reveal > $LOSER's stealth mint! 🎭", 8, Rarity.RARE),
            Message(unicode"$WINNER's sandwich > $LOSER's market order 🥪", 8, Rarity.RARE),
            Message(unicode"$WINNER: 'imagine getting rugged' $LOSER: *gets rugged anyway* 🏃", 8, Rarity.RARE),
            Message(unicode"$WINNER's hardware wallet > $LOSER's metamask 🔐", 8, Rarity.RARE),
            Message(unicode"$WINNER: 'ser check my NFT floor' $LOSER: *floor at zero* 📉", 8, Rarity.RARE),
            Message(unicode"$WINNER's degen play > $LOSER's index fund 🎲", 8, Rarity.RARE),
            Message(unicode"$WINNER: 'i warned anon' $LOSER: *buys top anyway* ⚠️", 8, Rarity.RARE),
            Message(unicode"$WINNER's chad gains vs $LOSER's virgin losses 📊", 8, Rarity.RARE),
            Message(unicode"$WINNER: 'i'm in it for the tech' $LOSER: *actually was* 💻", 8, Rarity.RARE),
            Message(unicode"$WINNER's limit order > $LOSER's market FOMO 📈", 8, Rarity.RARE),
            Message(unicode"$WINNER: 'anon, i am the liquidity' $LOSER: *gets dried* 💧", 8, Rarity.RARE),

            // Epic GONAD specials (Purple) - weight: 5
            Message(unicode"$WINNER's GONAD energy turned $LOSER into a meme coin! 🪙", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD stack made $LOSER's stack look smol! 📚", 5, Rarity.EPIC),
            Message(unicode"$WINNER proved GONAD supremacy to $LOSER! 👑", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD-backed position liquidated $LOSER! 💦", 5, Rarity.EPIC),
            Message(unicode"$WINNER's chad wallet destroyed $LOSER's virgin portfolio! 👑", 5, Rarity.EPIC),
            Message(unicode"$WINNER's gigabrain play made $LOSER look like a nocoiner! 🧠", 5, Rarity.EPIC),
            Message(unicode"$WINNER found $LOSER's private key under the rug! 🔑", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD thesis made $LOSER overdose on hopium! 💊", 5, Rarity.EPIC),
            Message(unicode"$WINNER's mempool > $LOSER's Internet Explorer! 🌊", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD stack is now $LOSER's whole marketcap! 📈", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD energy made $LOSER touch grass! 🌱", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD stack > $LOSER's entire portfolio! 💰", 5, Rarity.EPIC),
            Message(unicode"$WINNER: 'GONAD or nothing' $LOSER: *chose nothing* 🎭", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD thesis destroyed $LOSER's FUD! 📜", 5, Rarity.EPIC),
            Message(unicode"$WINNER proved GONAD supremacy, $LOSER still in denial! 👑", 5, Rarity.EPIC),

            // Legendary tech memes (Orange) - weight: 3
            Message(unicode"$WINNER's zero-knowledge proof > $LOSER's trust me bro! 🤫", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's rollup > $LOSER's side chain! 📜", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's consensus > $LOSER's fork! ", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's mainnet > $LOSER's testnet! 🌐", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's private key > $LOSER's seed phrase! ", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's node > $LOSER's API! ", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's merkle root > $LOSER's binary tree! ", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's state channel > $LOSER's gas fees! ⚡", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's bytecode > $LOSER's spaghetti code! 💻", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's EVM > $LOSER's VM! 🤖", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER found $LOSER's lost seed phrase and made an NFT of it! 🔑", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's trading algorithm predicted $LOSER's every move! ��", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's diamond hands turned $LOSER's paper hands to dust! 💎", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER wrote the smart contract that rekt $LOSER! 📝", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's wallet address is now $LOSER's nightmare! 👻", 3, Rarity.LEGENDARY),

            // Mythic chad messages (Red) - weight: 2
            Message(unicode"$WINNER's sigma grindset destroyed $LOSER's beta mindset! 💪", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER: 'WAGMI' $LOSER: 'NGMI' The prophecy was true! ��", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER found $LOSER's lost seed phrase and burned it! 🔥", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's portfolio survived winter, $LOSER's didn't make it! ❄️", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER bought the dip, $LOSER caught the knife! 📉", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER: 'have fun staying poor' $LOSER: *stays poor* 💸", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's diamond balls > $LOSER's paper hands! 💎", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER wrote the smart contract, $LOSER didn't read it! 📜", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's chad NFT destroyed $LOSER's right-click save! 🖼️", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER is typing... $LOSER has left the chat! ��", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER achieved GONAD enlightenment while $LOSER stayed ngmi! 🧘", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's sigma grindset made $LOSER delete Metamask! ��", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's portfolio survived 10 bear markets, $LOSER's didn't survive one! 🐻", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER found the bottom, $LOSER caught every falling knife! 📉", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER: 'I am the one who knocks' $LOSER: *gets liquidated* ��", 2, Rarity.MYTHIC),

            // Yeni GONAD/MONAD özel mesajları (Epic - weight: 5)
            Message(unicode"$WINNER's GONAD stack made $LOSER question existence! 🤯", 5, Rarity.EPIC),
            Message(unicode"$WINNER: 'GONAD = MONAD' $LOSER: *mind blown* 🧠", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD thesis > $LOSER's PhD dissertation! 📚", 5, Rarity.EPIC),
            Message(unicode"$WINNER staked GONAD, $LOSER staked FOMO! 📈", 5, Rarity.EPIC),
            Message(unicode"$WINNER's GONAD memes > $LOSER's Twitter threads! 🐦", 5, Rarity.EPIC),

            // Yeni Legendary mesajlar (weight: 3)
            Message(unicode"$WINNER's GONAD-powered smart contract made $LOSER's code look like HTML! ��", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's GONAD stack is now part of DeFi history, $LOSER's still on Robinhood! 📱", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's GONAD strategy will be taught in universities, $LOSER's in 'what not to do'! 🎓", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER's GONAD position made $LOSER's blue chips look like shitcoins! 💎", 3, Rarity.LEGENDARY),
            Message(unicode"$WINNER wrote GONAD on the blockchain, $LOSER wrote it on toilet paper! 📜", 3, Rarity.LEGENDARY),

            // Yeni Mythic mesajlar (weight: 2)
            Message(unicode"$WINNER achieved GONAD nirvana while $LOSER still thinks it's just a token! 🧘", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's GONAD enlightenment made $LOSER delete their wallet! 💫", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's GONAD thesis will be remembered for generations, $LOSER's FUD forgotten tomorrow! 📖", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's GONAD strategy became a Harvard case study, $LOSER became a meme! ��", 2, Rarity.MYTHIC),
            Message(unicode"$WINNER's GONAD journey is now crypto folklore, $LOSER's a cautionary tale! 🗿", 2, Rarity.MYTHIC)
        ];
        
        uint256 totalWeight = 0;
        for(uint i = 0; i < messages.length; i++) {
            totalWeight += messages[i].weight;
        }
        
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % totalWeight;
        uint256 currentWeight = 0;
        
        for(uint i = 0; i < messages.length; i++) {
            currentWeight += messages[i].weight;
            if(random < currentWeight) {
                string memory result = messages[i].text;
                result = _replace(result, "$WINNER", winner);
                result = _replace(result, "$LOSER", loser);
                return (result, messages[i].rarity);
            }
        }
        
        return ("GONAD is the way!", Rarity.COMMON);
    }

    // Helper function for string replacement
    function _replace(
        string memory source, 
        string memory search, 
        string memory replacement
    ) private pure returns (string memory) {
        return string(abi.encodePacked(
            _split(source, search, true),
            replacement,
            _split(source, search, false)
        ));
    }
    
    function _split(
        string memory source,
        string memory search,
        bool before
    ) private pure returns (string memory) {
        bytes memory sourceBytes = bytes(source);
        bytes memory searchBytes = bytes(search);
        
        uint256 index;
        for(uint i = 0; i < sourceBytes.length - searchBytes.length + 1; i++) {
            bool found = true;
            for(uint j = 0; j < searchBytes.length; j++) {
                if(sourceBytes[i + j] != searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if(found) {
                index = i;
                break;
            }
        }
        
        bytes memory result = new bytes(before ? index : sourceBytes.length - (index + searchBytes.length));
        for(uint i = 0; i < result.length; i++) {
            result[i] = sourceBytes[before ? i : i + index + searchBytes.length];
        }
        return string(result);
    }
} 