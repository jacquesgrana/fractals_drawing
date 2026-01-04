// utils/UserUtil.ts
import { UserLogin, UserInfo, Nullable, UserRegister } from "../types/indexType";


class UserUtil {
    public static formatRoles(roles: string[]): string {
        let toReturn = '';
        if (roles.length === 0) {
            return 'Aucun';
        }
        for (let i = 0; i < roles.length; i++) {
            // faire méthode
            if(roles[i] === 'ROLE_USER') {
                toReturn += 'Utilisateur, ';
            }
            else if(roles[i] === 'ROLE_ADMIN') {
                toReturn += 'Administrateur, ';
            }
            else if(roles[i] === 'ROLE_SUPER_ADMIN') {
                toReturn += 'Super Administrateur, ';
            }
        }
        if(toReturn.length > 2) {
            toReturn = toReturn.substring(0, toReturn.length - 2);
            toReturn += '.';
        }
        return toReturn
    }
}

export default UserUtil;