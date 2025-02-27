export const BATTLE_MESSAGES_ADDRESS = '0x58E97aE44F070047d9db35c7C134781162D185f1';
export const GONAD_TOKEN_ADDRESS = '0x4d04698539470b14187cd4b8a9a8f41da5787773';
export const GLADIATOR_ARENA_ADDRESS = '0x68318e6fb047a44dbcd3da7f025a0ea52a73cc7d';
export const GONAD_DISTRIBUTOR_ADDRESS = '0x19c6b80abc3cdca099ebf682361058ef59c9ce9d';


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