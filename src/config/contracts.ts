export const BATTLE_MESSAGES_ADDRESS = '0x16a7D368E66cA3E123e4802fa2bcc7BEf25cc9c1';
export const GONAD_TOKEN_ADDRESS = '0x74DB79c0Adb22f5869140893741091C8B312Ba69';
export const GLADIATOR_ARENA_ADDRESS = '0x54e1d41837bDc3448101Eeffa779A959fA48bbD9';
export const GONAD_DISTRIBUTOR_ADDRESS = '0x7f88E6995dF4956D3c3430236EE36111B9aCFa6D';




// Contract ABIs will be imported from the artifacts
import gladiatorArenaABI from './abi/GladiatorArena.json';
import gonadTokenABI from './abi/Gonad.json';
import gonadDistributorABI from './abi/GonadDistributor.json';


export const contracts = {
  gladiatorArena: {
    address: GLADIATOR_ARENA_ADDRESS,
    abi: gladiatorArenaABI,
  },
  gonadToken: {
    address: GONAD_TOKEN_ADDRESS,
    abi: gonadTokenABI,
  },
  gonadDistributor: {
    address: GONAD_DISTRIBUTOR_ADDRESS,
    abi: gonadDistributorABI,
  },
} as const; 