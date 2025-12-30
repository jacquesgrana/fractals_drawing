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

    return(
        <nav id="react-header">
            {/* Attention: Utilise <Link> et non <a href> pour ne pas recharger la page */}
            <Link className="react-link" to="/">Accueil</Link>
            <Link className="react-link" to="/draw">Dessin</Link>
            <Link className="react-link" to="/login">Login</Link>
            {isAuthenticated ? <div>Connecté en tant que {user?.email}</div> : <div>Non connecté</div>}
        </nav>
    );
};
export default Header;