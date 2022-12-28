import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { useCallback, useMemo } from 'react'

type SiweLoginProps = {
    statement?: string;
    onSuccess: (payload: { message: string; signature: string; }) => Promise<void> | void;
    onFailure: (error: unknown) => Promise<void> | void;
}

const useConnectWallet = () => {
    const provider = useMemo(() => new ethers.providers.Web3Provider((window as any).ethereum), [])
    const signer = useMemo(() => provider.getSigner(), [])
    const connectWallet = useCallback(async () => provider.send('eth_requestAccounts', []), [provider])
    return useMemo(() => ({ connectWallet, signer, provider }), [connectWallet, signer, provider])
}

const useSiweLogin = () => {
    return null
}

export const SiweLogin = ({ statement, onFailure, onSuccess }: SiweLoginProps) => {
    return null;
}