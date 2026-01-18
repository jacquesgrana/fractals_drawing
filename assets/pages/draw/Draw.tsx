import React, { useEffect } from 'react';
import DrawZone from './DrawZone';
import JuliaFractalPublicList from './JuliaFractalPublicList';
import JuliaFractalService from '../../services/JuliaFractalService';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Nullable, UserInfo } from '../../types/indexType';
import SecurityService from '../../services/SecurityService';
import JuliaFractalUserList from './JuilaFractalUserList';

const Draw = () : React.ReactElement => {
    const [isLoadingPublicJuliaFractals, setIsLoadingPublicJuliaFractals] = React.useState<boolean>(false);
    const [isLoadingUserJuliaFractals, setIsLoadingUserJuliaFractals] = React.useState<boolean>(false);
    const [publicJuliaFractals, setPublicJuliaFractals] = React.useState<JuliaFractal[]>([]);
    const [userJuliaFractals, setUserJuliaFractals] = React.useState<JuliaFractal[]>([]);
    // 1. Nouvel état pour stocker celle qu'on a cliqué
    const [selectedJuliaFractal, setSelectedJuliaFractal] = React.useState<Nullable<JuliaFractal>>(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    const [user, setUser] = React.useState<Nullable<UserInfo>>(null);
    const [isJuliaFractalListPanelOpen, setIsJuliaFractalListPanelOpen] = React.useState<boolean>(false);
    const [isJuliaFractalUserListPanelOpen, setIsJuliaFractalUserListPanelOpen] = React.useState<boolean>(false);
    const unsubscribeRef = React.useRef<Nullable<() => void>>(null);
    
    const juliaFractalService = JuliaFractalService.getInstance();
    //const canvasService = CanvasService.getInstance();
    const securityService = SecurityService.getInstance();

    const updateAuthState = React.useCallback(() => {
        setIsAuthenticated(securityService.isAuthenticated());
        setUser(securityService.getUser());
    }, [securityService]);
    
    useEffect(() => {
        // Abonnement aux changements d'authentification
        const unsubscribe = securityService.subscribe((currentUser) => {
            updateAuthState();
        });
        unsubscribeRef.current = unsubscribe;

        // Mise à jour initiale de l'état
        updateAuthState();

        // Nettoyage lors du démontage
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [securityService, updateAuthState]);

    useEffect(() => {
        const init = async () => {
            setIsLoadingPublicJuliaFractals(true);
            setIsLoadingUserJuliaFractals(true);
            await juliaFractalService.initService();
            setPublicJuliaFractals(juliaFractalService.getPublicJuliaFractals());
            setUserJuliaFractals(juliaFractalService.getUserJuliaFractals());
            setCurrentJuliaFractal(juliaFractalService.getPublicJuliaFractals()[0]);
            setIsLoadingPublicJuliaFractals(false);
            setIsLoadingUserJuliaFractals(false);
        }
        init();
    }, [juliaFractalService]);

    const reloadUserJuliaFractals = async () => {
        setIsLoadingUserJuliaFractals(true);
        await juliaFractalService.initService();
        setUserJuliaFractals(juliaFractalService.getUserJuliaFractals());
        setIsLoadingUserJuliaFractals(false);
    }

    const setCurrentJuliaFractal = (juliaFractal: JuliaFractal) => {
        //console.log("set current julia fractal: " + juliaFractal);
        setSelectedJuliaFractal(juliaFractal.clone());
        //canvasService.setJuliaFractal(juliaFractal);
    }

    const handleToggleIsJuliaFractalListPanelOpen = () => {
        setIsJuliaFractalListPanelOpen(!isJuliaFractalListPanelOpen);
    }

    const handleToggleIsJuliaFractalUserListPanelOpen = () => {
        setIsJuliaFractalUserListPanelOpen(!isJuliaFractalUserListPanelOpen);
    }

    return (
        <div className="react-card draw-page">
            <h2>Page de dessin</h2>
            <p>Bienvenue !</p>
            <DrawZone selectedJuliaFractal={selectedJuliaFractal} />
            { isLoadingPublicJuliaFractals && (
                <p>Chargement des fractales...</p>
            )}
            { !isLoadingPublicJuliaFractals && publicJuliaFractals.length > 0 && (
                <JuliaFractalPublicList
                juliaFractals ={publicJuliaFractals} 
                setCurrentJuliaFractal={setCurrentJuliaFractal}
                isJuliaFractalListPanelOpen={isJuliaFractalListPanelOpen}
                handleToggleIsJuliaFractalListPanelOpen={handleToggleIsJuliaFractalListPanelOpen}
                isAuthenticated={isAuthenticated}
                reloadUserJuliaFractals={reloadUserJuliaFractals}
                />
            )}
            { !isLoadingUserJuliaFractals && userJuliaFractals.length > 0 && (
                <JuliaFractalUserList
                juliaFractals={userJuliaFractals}
                setCurrentJuliaFractal={setCurrentJuliaFractal}
                isJuliaFractalUserListPanelOpen={isJuliaFractalUserListPanelOpen}
                handleToggleIsJuliaFractalUserListPanelOpen={handleToggleIsJuliaFractalUserListPanelOpen}
                isAuthenticated={isAuthenticated}
                />
            )}
            
        </div>
    );
};
export default Draw;
