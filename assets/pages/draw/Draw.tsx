import React, { useEffect } from 'react';
import DrawZone from './DrawZone';
import JuliaFractalPublicList from './JuliaFractalPublicList';
import JuliaFractalService from '../../services/JuliaFractalService';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Nullable, UserInfo } from '../../types/indexType';
import SecurityService from '../../services/SecurityService';
import JuliaFractalUserList from './JuilaFractalUserList';
import ToastFacade from '../../facade/ToastFacade';
import ViewJuliaFractalModal from './ViewJuliaFractalModal';

type DrawProps = {
    isCheckingAuth: boolean;
}

const Draw = ({
        isCheckingAuth
    }: DrawProps) : React.ReactElement => {

    const [isLoadingPublicJuliaFractals, setIsLoadingPublicJuliaFractals] = React.useState<boolean>(false);
    const [isLoadingUserJuliaFractals, setIsLoadingUserJuliaFractals] = React.useState<boolean>(false);
    const [publicJuliaFractals, setPublicJuliaFractals] = React.useState<JuliaFractal[]>([]);
    const [userJuliaFractals, setUserJuliaFractals] = React.useState<JuliaFractal[]>([]);
    const [selectedJuliaFractal, setSelectedJuliaFractal] = React.useState<Nullable<JuliaFractal>>(null);
    const [viewedJuliaFractal, setViewedJuliaFractal] = React.useState<Nullable<JuliaFractal>>(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    const [user, setUser] = React.useState<Nullable<UserInfo>>(null);
    const [isJuliaFractalListPanelOpen, setIsJuliaFractalListPanelOpen] = React.useState<boolean>(false);
    const [isJuliaFractalUserListPanelOpen, setIsJuliaFractalUserListPanelOpen] = React.useState<boolean>(false);
    const [isModalViewJuliaFractalOpen, setIsModalViewJuliaFractalOpen] = React.useState(false);
    
   
    const unsubscribeRef = React.useRef<Nullable<() => void>>(null);
    
    const juliaFractalService = JuliaFractalService.getInstance();
    //const canvasService = CanvasService.getInstance();
    const securityService = SecurityService.getInstance();

    const updateAuthState =  React.useCallback(() => {
        setIsAuthenticated(() => securityService.isAuthenticated());
        setUser(() => securityService.getUser());
    }, [isCheckingAuth]);
    
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
        if(!isCheckingAuth) {
            updateAuthState();
        }
    }, [isCheckingAuth]);

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

    const handleOpenViewJuliaFractalModal = () => {
        setIsModalViewJuliaFractalOpen(true);
    }

    const handleCloseViewJuliaFractalModal = () => {
        setIsModalViewJuliaFractalOpen(false);
    }

    const reloadAllJuliaFractals = async () => {
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

    const handleDeleteJuliaFractal = async (juliaFractal: JuliaFractal) => {
        if(!juliaFractal) {
            return;
        }
        const confirm = window.confirm('Voulez-vous vraiment supprimer définitivement cette fractale ?');
        if(!confirm) {
            return;
        }

        const response = await juliaFractalService.deleteUserJuliaFractal(juliaFractal);
        if(!response) {
            return;
        }
        try {
            const data = await response.json();
            if (data.status === 200) {
                ToastFacade.success('Suppression réussie : ' + data.message + ' !');
                await reloadAllJuliaFractals();
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
            }
            else if (data.status === 403) {
                ToastFacade.error('Erreur 403 : ' + data.message + ' !');
            }
            else if (data.status === 404) {
                ToastFacade.error('Erreur 404 : ' + data.message + ' !');
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
            }
        }
        catch (error) {
            ToastFacade.error('Erreur : Erreur lors de la suppression de la fractale ! : ' + error);
        }
    }

    const handleViewJuliaFractal = (juliaFractal: JuliaFractal) => {
        //console.log("view julia fractal: " + juliaFractal.getUser().pseudo);
        setViewedJuliaFractal(juliaFractal);
        setIsModalViewJuliaFractalOpen(true);
    }

    const handleToggleIsJuliaFractalListPanelOpen = () => {
        setIsJuliaFractalListPanelOpen(!isJuliaFractalListPanelOpen);
    }

    const handleToggleIsJuliaFractalUserListPanelOpen = () => {
        setIsJuliaFractalUserListPanelOpen(!isJuliaFractalUserListPanelOpen);
    }

    return (
        <>
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
                reloadUserJuliaFractals={reloadAllJuliaFractals}
                handleViewJuliaFractal={handleViewJuliaFractal}
                />
            )}
            { !isLoadingUserJuliaFractals && userJuliaFractals.length > 0 && (
                <JuliaFractalUserList
                juliaFractals={userJuliaFractals}
                setCurrentJuliaFractal={setCurrentJuliaFractal}
                isJuliaFractalUserListPanelOpen={isJuliaFractalUserListPanelOpen}
                handleToggleIsJuliaFractalUserListPanelOpen={handleToggleIsJuliaFractalUserListPanelOpen}
                isAuthenticated={isAuthenticated}
                handleDeleteJuliaFractal={handleDeleteJuliaFractal}
                handleViewJuliaFractal={handleViewJuliaFractal}
                />
            )}
            
        </div>
        { isModalViewJuliaFractalOpen && (
            <ViewJuliaFractalModal
            isModalViewJuliaFractalOpen={isModalViewJuliaFractalOpen}
            handleCloseViewJuliaFractalModal={handleCloseViewJuliaFractalModal}
            juliaFractal={viewedJuliaFractal}
            />
        )}
        </>
    );
};
export default Draw;
