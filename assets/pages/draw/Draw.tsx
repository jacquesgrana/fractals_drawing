import React, { useEffect } from 'react';
import DrawZone from './DrawZone';
import JuliaFractalList from './JuliaFractalList';
import JuliaFractalService from '../../services/JuliaFractalService';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Nullable, UserInfo } from '../../types/indexType';
import SecurityService from '../../services/SecurityService';

const Draw = () : React.ReactElement => {
    const [isLoadingJuliaFractals, setIsLoadingJuliaFractals] = React.useState<boolean>(false);
    const [juliaFractals, setJuliaFractals] = React.useState<JuliaFractal[]>([]);
    // 1. Nouvel état pour stocker celle qu'on a cliqué
    const [selectedJuliaFractal, setSelectedJuliaFractal] = React.useState<Nullable<JuliaFractal>>(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    const [user, setUser] = React.useState<Nullable<UserInfo>>(null);
    const [isJuliaFractalListPanelOpen, setIsJuliaFractalListPanelOpen] = React.useState<boolean>(false);

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
            setIsLoadingJuliaFractals(true);
            await juliaFractalService.initService();
            setJuliaFractals(juliaFractalService.getPublicJuliaFractals());
            setCurrentJuliaFractal(juliaFractalService.getPublicJuliaFractals()[0]);
            setIsLoadingJuliaFractals(false);
        }
        init();
    }, []);

    const setCurrentJuliaFractal = (juliaFractal: JuliaFractal) => {
        //console.log("set current julia fractal: " + juliaFractal);
        setSelectedJuliaFractal(juliaFractal.clone());
        //canvasService.setJuliaFractal(juliaFractal);
    }

    const handleToggleIsJuliaFractalListPanelOpen = () => {
        setIsJuliaFractalListPanelOpen(!isJuliaFractalListPanelOpen);
    }

    return (
        <div className="react-card draw-page">
            <h2>Page de dessin</h2>
            <p>Bienvenue !</p>
            <DrawZone selectedJuliaFractal={selectedJuliaFractal} />
            { isLoadingJuliaFractals && (
                <p>Chargement des fractales...</p>
            )}
            { !isLoadingJuliaFractals && juliaFractals.length > 0 && (
                <JuliaFractalList
                juliaFractals ={juliaFractals} 
                setCurrentJuliaFractal={setCurrentJuliaFractal}
                isJuliaFractalListPanelOpen={isJuliaFractalListPanelOpen}
                handleToggleIsJuliaFractalListPanelOpen={handleToggleIsJuliaFractalListPanelOpen}
                isAuthenticated={isAuthenticated}
                />
            )}
            
        </div>
    );
};
export default Draw;
