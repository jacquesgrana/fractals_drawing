
import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import JuliaFractalListElement from './JuliaFractalListElement';

interface JuliaFractalListProps {
    juliaFractals: JuliaFractal[];
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isJuliaFractalListPanelOpen: boolean;
    handleToggleIsJuliaFractalListPanelOpen: () => void;
    isAuthenticated: boolean;
}

const JuliaFractalList = ({ 
    juliaFractals, 
    setCurrentJuliaFractal,
    isJuliaFractalListPanelOpen,
    handleToggleIsJuliaFractalListPanelOpen,
    isAuthenticated
} : JuliaFractalListProps ) : React.ReactElement => {

    return (
        <div className="react-fractal-list">
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
                    />
                ))}
                </div>
            ) }
            
        </div>
    );
};

export default JuliaFractalList;

/*
<li key={juliaFractal.getId()}>{juliaFractal.getName()}</li>
*/