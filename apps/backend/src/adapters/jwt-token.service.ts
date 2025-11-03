import { TokenService, TokenPayload } from "@domain/services/token.service";
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config(); // Asegura que las variables de entorno estén cargadas

// Configuración del JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_development';
const JWT_EXPIRATION = '7d'; // 7 días de validez

export class JwtTokenService implements TokenService {
    
    async generateToken(payload: TokenPayload): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                payload, 
                JWT_SECRET, 
                { expiresIn: JWT_EXPIRATION }, 
                (err, token) => {
                    if (err || !token) {
                        return reject(new Error("Failed to generate token."));
                    }
                    resolve(token);
                }
            );
        });
    }


    async verifyToken(token: string): Promise<TokenPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err || !decoded) {
                    return reject(new Error("Invalid or expired token."));
                }
                resolve(decoded as TokenPayload); 
            });
        });
    }
}