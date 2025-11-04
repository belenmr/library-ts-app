import { UserRepository } from '@domain/repositories/user.repository';
import { User } from '@domain/entities/user'; 
import { RoleName } from '@domain/entities/role';
import { PrismaClient } from '@prisma/client';
import { RoleService } from '@domain/services/role.service'

export class UserPrismaRepository implements UserRepository {
    
    constructor(
        private readonly prisma: PrismaClient,
        private readonly roleService: RoleService
    ) {} 

    // --- Mapeador de Prisma (DB) a Dominio (Entidad) ---
    private toDomainUser = (prismaUser: any): User => {
        const domainRole = this.roleService.getRoleByName(prismaUser.roleName as RoleName);

        if (!domainRole) {
            // Este caso no debería ocurrir si los datos son válidos
            throw new Error(`Integrity Error: Role '${prismaUser.roleName}' not found in RoleService.`);
        }

        return {
            id: prismaUser.id,
            name: prismaUser.name,
            surname: prismaUser.surname,
            email: prismaUser.email,
            passwordHash: prismaUser.passwordHash,
            hasPendingFine: prismaUser.hasPendingFine,
            role: domainRole,
        };
    };

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.toDomainUser(user) : null;
    }
    
    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.toDomainUser(user) : null;
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany();
        return users.map(this.toDomainUser);
    }
    
    async findByRole(roleName: RoleName): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: { roleName: roleName }
        });
        return users.map(this.toDomainUser);
    }
    
    async save(user: User): Promise<void> {
        
        await this.prisma.user.upsert({
            where: { id: user.id },
            update: { 
                name: user.name,
                surname: user.surname,
                email: user.email,
                roleName: user.role.name, 
                hasPendingFine: user.hasPendingFine,
                passwordHash: user.passwordHash
            },
            create: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                passwordHash: user.passwordHash,
                roleName: user.role.name,
                hasPendingFine: user.hasPendingFine,
            },
        });
    }
}