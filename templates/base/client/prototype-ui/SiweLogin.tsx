import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { JsonRpcSigner } from '@ethersproject/providers';
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

const useSiweLogin = (signer: JsonRpcSigner) => {
    //not entirely sure where we are pulling most of these values from yet
    const siweMessage: SiweMessage = {
        domain: '',
        address: '',
        statement: '',
        uri: '',
        version: '1',
        chainId: 1
    }
    return useMemo(() => ({ siweMessage}), [siweMessage])
}

export const SiweLogin = ({ statement, onFailure, onSuccess }: SiweLoginProps) => {
    const { connectWallet, signer } = useConnectWallet()
    const { siweMessage } = useSiweLogin(signer)
    const handleLogin = useCallback(async () => {
        try {
            await connectWallet()
            const message = new SiweMessage(siweMessage)
            const signature = await signer.signMessage(message.toString())
            await onSuccess({ message: siweMessage, signature })
        } catch (error) {
            onFailure(error)
        }
    }, [connectWallet, onFailure, onSuccess, siweMessage, signer])
    return (
        <button onClick={handleLogin} className="inline-flex items-center rounded-full border px-6 py-2 text-base font-medium shadow-sm transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500 border-transparent bg-brand-500 text-neutralgray-700 hover:bg-secondary-500 text-neutralgray-700 border border-neutralgray-700">Login</button>
    )
}