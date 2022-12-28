type SiweLoginProps = {
    statement?: string;
    onSuccess: (payload: { message: string; signature: string; }) => Promise<void> | void;
    onFailure: (error: unknown) => Promise<void> | void;
}

export const SiweLogin = ({ statement, onFailure, onSuccess }: SiweLoginProps) => {
    return null;
}