import { PrismaClient } from '@prisma/client';
import { DefaultRoleService } from '@domain/services/default-role.service'; 
import { BcryptPasswordService } from '../adapters/bcrypt-password.service';
import type { Role } from '@domain/entities/role';
import { RoleName } from '@domain/entities/role';

const prisma = new PrismaClient();
const passwordService = new BcryptPasswordService();
const roleService = new DefaultRoleService(); 

async function main() {
    console.log('--- Iniciando Seeding de la base de datos...');
    console.log("CWD:", process.cwd());
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    // 1. CARGA DE ROLES (Modelos que son fijos)
    const roles: Role[] = roleService.listRoles(); 

    for (const role of roles) {
        // Guardar el Role en la tabla de Prisma
        // Nota: Solo guardamos 'name' y 'permissions' (convertido a JSON string)
        await prisma.role.upsert({
            where: { name: role.name },
            update: { permissions: JSON.stringify(role.permissions) },
            create: { 
                name: role.name, 
                permissions: JSON.stringify(role.permissions) 
            },
        });
        console.log(`[Role] Creado/Actualizado: ${role.name}`);
    }

    // 2. CREACIÓN DEL USUARIO ADMINISTRADOR INICIAL
    const ADMIN_EMAIL = 'admin@library.com';
    const ADMIN_PASSWORD = 'adminPass123!';
    
    // Obtener los detalles del rol ADMIN del servicio de dominio
    const adminRole = roleService.getRoleByName(RoleName.ADMIN);
    if (!adminRole) {
        throw new Error('Error de configuración: El rol ADMIN no está definido en DefaultRoleService.');
    }

    // Hashear la contraseña
    const passwordHash = await passwordService.hash(ADMIN_PASSWORD);

    // Crear el usuario ADMIN
    await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { 
            name: 'Super Admin',
            passwordHash: passwordHash,
            roleName: RoleName.ADMIN 
        },
        create: {
            id: 'admin-uuid-001', // ID fijo para el primer admin
            name: 'Super Admin',
            surname: 'System',
            email: ADMIN_EMAIL,
            passwordHash: passwordHash,
            roleName: RoleName.ADMIN, 
            hasPendingFine: false,
        },
    });
    console.log(`[User] Creado usuario administrador: ${ADMIN_EMAIL}`);
    console.log(`[INFO] Contraseña del Admin: ${ADMIN_PASSWORD}`);
    
    // 3. CARGA DE CONFIGURACIÓN POR DEFECTO (Límites de Préstamo)
    const MEMBER_LOAN_LIMIT = 2;
    
    // Guardar el límite del MEMBER en la tabla Configuration
    await prisma.configuration.upsert({
        where: { key: 'LOAN_LIMIT_MEMBER' },
        update: { value: MEMBER_LOAN_LIMIT.toString() },
        create: { key: 'LOAN_LIMIT_MEMBER', value: MEMBER_LOAN_LIMIT.toString() },
    });
    console.log(`[Config] Límite de préstamo de MEMBER configurado a ${MEMBER_LOAN_LIMIT}`);


}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });