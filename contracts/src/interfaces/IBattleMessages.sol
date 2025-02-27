// SPDX-License-Identifier: MIT
pragma solidity =0.8.28;

interface IBattleMessages {
    enum Rarity {
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY,
        MYTHIC
    }
    
    function getRandomBattleMessage(
        string memory winner,
        string memory loser
    ) external view returns (string memory message, Rarity rarity);
} 