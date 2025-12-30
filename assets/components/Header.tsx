import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nullable, UserInfo } from '../types/indexType';
import SecurityService from '../services/SecurityService';

const Header = () : React.ReactElement => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<null | UserInfo>(null);
    const securityService = SecurityService.getInstance();

    const unsubscribeRef = useRef<Nullable<() => void>>(null);

    const updateAuthState = useCallback(() => {
        setIsAuthenticated(securityService.isAuthenticated());
        setUser(securityService.getUser());
    }, [securityService]);

    useEffect(() => {
        // Chargement initial
        //securityService.onLoad();
        //setIsAuthenticated(securityService.isAuthenticated());
        // Abonnement aux changements d'authentification
        const unsubscribe = securityService.subscribe((currentUser) => {
            updateAuthState();
        });
        unsubscribeRef.current = unsubscribe;

        // Mise à jour initiale de l'état
        updateAuthState();

        // Vérification initiale du token
        //checkTokenValidity();

        // Nettoyage lors du démontage
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [securityService, updateAuthState]);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        await securityService.logout();
        
        // Redirection après déconnexion
        //navigate('/login'); 
    };

    return(
        <div id="react-header">
            <h1>Fractals Drawing</h1>
            
            <nav id="react-header-nav">
                <Link className="react-link" to="/">Accueil</Link>
                <Link className="react-link" to="/draw">Dessin</Link>
                {!isAuthenticated ? (<Link className="react-link" to="/login">Login</Link>)  : (<a href="#" className="react-link" onClick={handleLogout}>Logout</a>) } 
            </nav>
            {isAuthenticated ? <div>Connecté en tant que {user?.email}</div> : <div>Non connecté</div>}
        </div>
    );
};
export default Header;