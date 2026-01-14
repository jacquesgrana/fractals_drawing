
import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import JuliaFractalListElement from './JuliaFractalListElement';

interface JuliaFractalListProps {
    juliaFractals: JuliaFractal[];
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;

}

const JuliaFractalList = ({ juliaFractals, setCurrentJuliaFractal } : JuliaFractalListProps ) : React.ReactElement => {

    return (
        <div className="react-fractal-list">
            <p>Liste des fractales</p>
            <div className="react-fractal-list-container">
                {juliaFractals.length > 0 && juliaFractals.map((juliaFractal) => (
                    <JuliaFractalListElement 
                    key={juliaFractal.getId()} 
                    juliaFractal={juliaFractal} 
                    setCurrentJuliaFractal={setCurrentJuliaFractal}
                    />
                ))}
            </div>
        </div>
    );
};

export default JuliaFractalList;

/*
<li key={juliaFractal.getId()}>{juliaFractal.getName()}</li>
*/