import React, { useEffect } from 'react';
import DrawZone from './DrawZone';
import JuliaFractalPublicList from './JuliaFractalPublicList';
import JuliaFractalService from '../../services/JuliaFractalService';
import { JuliaFractal } from '../../model/JuliaFractal';
import { JuliaFractalParams, Nullable, UserInfo } from '../../types/indexType';
import SecurityService from '../../services/SecurityService';
import JuliaFractalUserList from './JuilaFractalUserList';
import ToastFacade from '../../facade/ToastFacade';
import ViewJuliaFractalModal from './ViewJuliaFractalModal';
import NewJuliaFractalModal from './NewJuliaFractalModal';
import EditJuliaFractalModal from './EditJuliaFractalModal';
import { ComplexNb } from '../../model/ComplexNb';
import { useNavigate } from 'react-router-dom';

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
    const [isModalNewJuliaFractalOpen, setIsModalNewJuliaFractalOpen] = React.useState(false);
    const [isModalEditJuliaFractalOpen, setIsModalEditJuliaFractalOpen] = React.useState(false);
    
    const newJuliaFractalParamsRef = React.useRef<Nullable<JuliaFractalParams>>(null);
    const unsubscribeRef = React.useRef<Nullable<() => void>>(null);
    const juliaFractalToEditRef = React.useRef<Nullable<JuliaFractal>>(null);
    const topAnchorRef = React.useRef<HTMLDivElement>(null);

    const juliaFractalService = JuliaFractalService.getInstance();
    //const canvasService = CanvasService.getInstance();
    const securityService = SecurityService.getInstance();

    const navigate = useNavigate();

    const updateAuthState =  React.useCallback(() => {
        setIsAuthenticated(() => securityService.isAuthenticated());
        setUser(() => securityService.getUser());
    }, []);
    
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

    const handleCloseNewJuliaFractalModal = () => {
        setIsModalNewJuliaFractalOpen(false);
    }

    const handleCloseEditJuliaFractalModal = () => {
        setIsModalEditJuliaFractalOpen(false);
    }

    const reloadAllJuliaFractals = async () => {
        setIsLoadingUserJuliaFractals(true);
        await juliaFractalService.initService();
        setUserJuliaFractals(juliaFractalService.getUserJuliaFractals());
        setPublicJuliaFractals(juliaFractalService.getPublicJuliaFractals());
        setIsLoadingUserJuliaFractals(false);
    }

    const setCurrentJuliaFractal = (juliaFractal: JuliaFractal) => {
        //console.log("set current julia fractal: " + juliaFractal);
        setSelectedJuliaFractal(juliaFractal.clone());
        // Revenir au haut de la page
        //window.scrollTo(0, 200);
        
        if (topAnchorRef.current) {
            // scrollIntoView gère le calcul des pixels pour toi
            topAnchorRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' // ou 'start' pour le coller en haut
            });
        }
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

    const handleNewJuliaFractal = (juliaFractalParams : JuliaFractalParams) => {
        //setIsModalNewJuliaFractalOpen(true);
        console.log("new julia fractal: " + juliaFractalParams);
        newJuliaFractalParamsRef.current = juliaFractalParams;
        // ouvrir modale
        setIsModalNewJuliaFractalOpen(true);
    }

    const handleEditJuliaFractal = (juliaFractal: JuliaFractal) => {
        //console.log("edit julia fractal named: " + juliaFractal.getName());
        juliaFractalToEditRef.current = juliaFractal;
        setIsModalEditJuliaFractalOpen(true);
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
            <p  ref={topAnchorRef}>Bienvenue !</p>
            <DrawZone
            selectedJuliaFractal={selectedJuliaFractal} 
            handleNewJuliaFractal={handleNewJuliaFractal}
            isAuthenticated={isAuthenticated}
            />
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
                handleEditJuliaFractal={handleEditJuliaFractal}
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
        { isModalNewJuliaFractalOpen && (
            <NewJuliaFractalModal
            isModalNewJuliaFractalOpen={isModalNewJuliaFractalOpen}
            handleCloseNewJuliaFractalModal={handleCloseNewJuliaFractalModal}
            newJuliaFractalParams={newJuliaFractalParamsRef?.current ? newJuliaFractalParamsRef.current : {seedReal: 0, seedImag: 0, maxIter: 0, limit: 0}}
            reloadAllJuliaFractals={reloadAllJuliaFractals}
            />
        )}
        { isModalEditJuliaFractalOpen && (
            <EditJuliaFractalModal
            isModalEditJuliaFractalOpen={isModalEditJuliaFractalOpen}
            handleCloseEditJuliaFractalModal={handleCloseEditJuliaFractalModal}
            juliaFractal={juliaFractalToEditRef.current?.clone() ? juliaFractalToEditRef.current.clone() : null}
            reloadAllJuliaFractals={reloadAllJuliaFractals}
            />
        )}
        </>
    );
};
export default Draw;
