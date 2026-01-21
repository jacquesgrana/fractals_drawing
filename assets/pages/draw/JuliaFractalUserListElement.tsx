import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';

interface JuliaFractalUserListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    handleDeleteJuliaFractal: (fractal: JuliaFractal) => void;
    handleViewJuliaFractal: (juliaFractal: JuliaFractal) => void
    //isAuthenticated: boolean
}


const JuliaFractalUserListElement: React.FC<JuliaFractalUserListElementProps> = ({ 
    juliaFractal, 
    setCurrentJuliaFractal,
    handleDeleteJuliaFractal,
    handleViewJuliaFractal
    //isAuthenticated
 }) => {
    //console.log("juliaFractal", juliaFractal);
    return (
        <div className='react-fractal-list-element'>
            <p className='text-small-black'><strong>{juliaFractal.getName()}</strong></p>
            <p className='text-small-black'>Création : <br/>{DateUtil.formatDate(juliaFractal.getCreatedAt())}</p>
            <p className='text-small-black'>Modification : <br/>{DateUtil.formatDate(juliaFractal.getUpdatedAt())}</p>
            <div className='d-flex gap-1 w-auto'> 
                <Button 
                variant="primary" 
                className='btn btn-primary-small' 
                title='Voir la fractale'
                onClick={() => handleViewJuliaFractal(juliaFractal)}
                >🔍
                </Button>
                <Button 
                variant="primary" 
                className='btn btn-primary-small' 
                title='Supprimer la fractale'
                onClick={() => handleDeleteJuliaFractal(juliaFractal)}
                >X
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