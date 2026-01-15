import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';

interface JuliaFractalListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
}


const JuliaFractalListElement: React.FC<JuliaFractalListElementProps> = ({ juliaFractal, setCurrentJuliaFractal }) => {
    return (
        <div className='react-fractal-list-element'>
            <p className='text-large-primary'>{juliaFractal.getName()}</p>
            <p className='text-small-black'>Création : {DateUtil.formatDate(juliaFractal.getCreatedAt())}</p>
            <p className='text-small-black'>Modification : {DateUtil.formatDate(juliaFractal.getUpdatedAt())}</p>
            <Button variant="primary" className='btn btn-primary-small' title='Voir la fractale' onClick={() => setCurrentJuliaFractal(juliaFractal)}>↵</Button>
        </div>
    );
};

export default JuliaFractalListElement;