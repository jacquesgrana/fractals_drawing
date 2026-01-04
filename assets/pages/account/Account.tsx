// assets/pages/account/Account.tsx

import React, { useCallback, useEffect, useState } from 'react';
import SecurityService from '../../services/SecurityService';
import { useNavigate } from 'react-router-dom';
import { Nullable, UserInfo } from '../../types/indexType';
import UserUtil from '../../utils/UserUtil';
import DateUtil from '../../utils/DateUtil';
import { Button } from 'react-bootstrap';
import ModalEditUser from '../register/ModalEditUser';


const Account = (): React.ReactElement => {
    const [user, setUser] = useState<Nullable<UserInfo>>(null);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);

    const securityService = SecurityService.getInstance();
    const navigate = useNavigate();  

    useEffect(() => {
        const checkAuth = async () => {
            await loadUser();
        };
        checkAuth();
    }, []);

    const loadUser = async () => {
        try {
            await securityService.me();
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

    const handleEditInfos = (e: React.MouseEvent) => {
        e.preventDefault();
        //navigate('/account/edit');
        console.log('Edit infos');
        setIsModalEditOpen(true);
    };

    const handleEditEmail = (e: React.MouseEvent) => {
        e.preventDefault();
        //navigate('/account/edit-email');
        console.log('Edit email');
    };

    const handleEditPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        //navigate('/account/edit-password');
        console.log('Edit password');
    };

    const handleCloseEditModal = useCallback(() => {
        setIsModalEditOpen(false);
    }, []);

    return (
        <>
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
                <Button type="button" onClick={handleEditInfos} className="btn btn-primary w-100">Modifier les infos</Button>
                <Button type="button" onClick={handleEditEmail} className="btn btn-primary w-100">Modifier l'email</Button>
                <Button type="button" onClick={handleEditPassword} className="btn btn-primary w-100">Modifier le mot de passe</Button>
            </div>
        </div>
        {user && isModalEditOpen && (
            <ModalEditUser 
                isModalEditUserOpen={isModalEditOpen}
                handleCloseEditUserModal={handleCloseEditModal}
                user={user}
                loadUser={loadUser}
            />
        )}
        </>
    );
};
export default Account;