import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';

interface JuliaFractalListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
}


const JuliaFractalListElement: React.FC<JuliaFractalListElementProps> = ({ juliaFractal, setCurrentJuliaFractal }) => {
    return (
        <div className='react-fractal-list-element'>
            <p>{juliaFractal.getName()}</p>
            <Button variant="primary" className='btn btn-primary-small' title='Voir la fractale' onClick={() => setCurrentJuliaFractal(juliaFractal)}>↵</Button>
        </div>
    );
};

export default JuliaFractalListElement;