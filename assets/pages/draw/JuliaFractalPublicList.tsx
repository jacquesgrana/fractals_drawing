
import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import JuliaFractalListElement from './JuliaFractalListElement';

interface JuliaFractalPublicListProps {
    juliaFractals: JuliaFractal[];
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isJuliaFractalListPanelOpen: boolean;
    handleToggleIsJuliaFractalListPanelOpen: () => void;
    isAuthenticated: boolean;
    reloadUserJuliaFractals: () => Promise<void>;
}

const JuliaFractalPublicList = ({ 
    juliaFractals, 
    setCurrentJuliaFractal,
    isJuliaFractalListPanelOpen,
    handleToggleIsJuliaFractalListPanelOpen,
    isAuthenticated,
    reloadUserJuliaFractals
} : JuliaFractalPublicListProps ) : React.ReactElement => {

    return (
        <div className="react-fractal-list mb-2">
            <p 
            onClick={handleToggleIsJuliaFractalListPanelOpen}
            className="text-small-black react-text-link-dark"
            >Liste des fractales de Julia publiques :</p>
            { isJuliaFractalListPanelOpen && (
                <div className="react-fractal-list-container">
                {juliaFractals.length > 0 && juliaFractals.map((juliaFractal) => (
                    <JuliaFractalListElement 
                    key={juliaFractal.getId()} 
                    juliaFractal={juliaFractal} 
                    setCurrentJuliaFractal={setCurrentJuliaFractal}
                    isAuthenticated={isAuthenticated}
                    reloadUserJuliaFractals={reloadUserJuliaFractals}
                    />
                ))}
                </div>
            ) }
            
        </div>
    );
};

export default JuliaFractalPublicList;

/*
<li key={juliaFractal.getId()}>{juliaFractal.getName()}</li>
*/