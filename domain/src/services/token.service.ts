interface TokenPayload {
    userId: string;
    roleName: string;
}

export interface TokenService {
    generateToken(payload: TokenPayload): Promise<string>;
    verifyToken(token: string): Promise<TokenPayload>;
}