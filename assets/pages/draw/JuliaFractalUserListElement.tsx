import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';

interface JuliaFractalUserListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    handleDeleteJuliaFractal: (fractal: JuliaFractal) => void
    //isAuthenticated: boolean
}


const JuliaFractalUserListElement: React.FC<JuliaFractalUserListElementProps> = ({ 
    juliaFractal, 
    setCurrentJuliaFractal,
    handleDeleteJuliaFractal
    //isAuthenticated
 }) => {

    return (
        <div className='react-fractal-list-element'>
            <p className='text-large-primary'>{juliaFractal.getName()}</p>
            <p className='text-small-black'>Création : {DateUtil.formatDate(juliaFractal.getCreatedAt())}</p>
            <p className='text-small-black'>Modification : {DateUtil.formatDate(juliaFractal.getUpdatedAt())}</p>
            <div className='d-flex align-items-center gap-2'> 
                <Button 
                variant="primary" 
                className='btn btn-primary-small' 
                title='Supprimer la fractale'
                onClick={() => handleDeleteJuliaFractal(juliaFractal)}
                >❌
                </Button>

                <Button 
                variant="primary" 
                className='btn btn-primary-small' 
                title='Dessiner la fractale' 
                onClick={() => setCurrentJuliaFractal(juliaFractal)}
                >↵
                </Button>
            </div>
        </div>
    );
};

export default JuliaFractalUserListElement;