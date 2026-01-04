// assets/pages/account/Account.tsx

import React, { useEffect, useState } from 'react';
import SecurityService from '../../services/SecurityService';
import { useNavigate } from 'react-router-dom';
import { Nullable, UserInfo } from '../../types/indexType';
import UserUtil from '../../utils/UserUtil';
import DateUtil from '../../utils/DateUtil';


const Account = (): React.ReactElement => {
    const [user, setUser] = useState<Nullable<UserInfo>>(null);
    const securityService = SecurityService.getInstance();
    const navigate = useNavigate();  

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await securityService.me();
                if (!securityService.isAuthenticated()) {
                    setUser(null);
                    navigate('/login');
                }
                else {
                    setUser(securityService.getUser());
                }   
            } 
            catch (error) {
                console.error('Erreur API', error);
            } 
            finally {
                //setIsLoading(false);
            }
        };

        checkAuth();
        
    }, []);


    return (
        <div className="react-card account-page">
            <h2>Page du compte</h2>
            <p>Page de gestion du compte.</p>
            {!user && (
                <p>Vous devez vous connecter pour accéder à cette page.</p>
            )}
            
            {user && (
                <div className="account-info">
                    <p className="account-info-text"><span className="text-warning-dark">Pseudo : </span>{user.pseudo}</p>
                    <p className="account-info-text"><span className="text-warning-dark">Email : </span>{user.email}</p>
                    <p className="account-info-text"><span className="text-warning-dark">Prénom : </span>{user.firstName}</p>
                    <p className="account-info-text"><span className="text-warning-dark">Nom : </span>{user.lastName}</p>
                    <p className="account-info-text"><span className="text-warning-dark">Role(s) : </span>{UserUtil.formatRoles(user.roles)}</p>
                    <p className="account-info-text"><span className="text-warning-dark">Création : </span>{DateUtil.formatDate(user.createdAt)}</p>
                    <p className="account-info-text"><span className="text-warning-dark">Mise à jour : </span>{DateUtil.formatDate(user.updatedAt)}</p>
                </div> 
            )}
            <div className="account-buttons-container">

            </div>
        </div>
    );
};
export default Account;