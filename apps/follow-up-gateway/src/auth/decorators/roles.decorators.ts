import { SetMetadata } from "@nestjs/common";
import { Role } from "apps/users/src/enums/roles.enums";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [Role, ...Role[]]) => SetMetadata(ROLES_KEY, roles)

// ...roles: you use the rest operator(...) on the roles parameter to accept any number of roles in the Role[] array
// combine the typescript tuples and the array type to avoid an empty an array: [Role, ...Role[]]