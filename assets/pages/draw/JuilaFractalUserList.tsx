import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import JuliaFractalUserListElement from './JuliaFractalUserListElement';

interface JuliaFractalUserListProps { 
    juliaFractals: JuliaFractal[];
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isJuliaFractalUserListPanelOpen: boolean;
    handleToggleIsJuliaFractalUserListPanelOpen: () => void;
    isAuthenticated: boolean;
    handleDeleteJuliaFractal: (fractal: JuliaFractal) => void
}

const JuliaFractalUserList = ({
    juliaFractals,
    setCurrentJuliaFractal,
    isJuliaFractalUserListPanelOpen,
    handleToggleIsJuliaFractalUserListPanelOpen,
    isAuthenticated,
    handleDeleteJuliaFractal
} : JuliaFractalUserListProps) : React.ReactElement => {


    return (
        <>
        { isAuthenticated && (
           <div className="react-fractal-list">
                <p 
                onClick={handleToggleIsJuliaFractalUserListPanelOpen}
                className="text-small-black react-text-link-dark"
                >Liste des fractales de Julia de l'utilisateur :</p>
                { isJuliaFractalUserListPanelOpen && (
                    <div className="react-fractal-list-container">
                        {juliaFractals.length > 0 && juliaFractals.map((juliaFractal) => (
                            <JuliaFractalUserListElement 
                            key={juliaFractal.getId()} 
                            juliaFractal={juliaFractal} 
                            setCurrentJuliaFractal={setCurrentJuliaFractal}
                            //isAuthenticated={isAuthenticated}
                            handleDeleteJuliaFractal={handleDeleteJuliaFractal}
                            />
                        ))}
                    </div>
                )}
            </div> 
        )}
        </>
    )
}

export default JuliaFractalUserList;