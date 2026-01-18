import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';

interface JuliaFractalListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isAuthenticated: boolean
}


const JuliaFractalListElement: React.FC<JuliaFractalListElementProps> = ({ juliaFractal, 
    setCurrentJuliaFractal,
    isAuthenticated
 }) => {
    const handleAddFractalToUserList = () => {
        console.log('Ajouter la fractale ' + juliaFractal.getName() + ' dans la liste des fractales de l\'utilisateur');
    }

    return (
        <div className='react-fractal-list-element'>
            <p className='text-large-primary'>{juliaFractal.getName()}</p>
            <p className='text-small-black'>Création : {DateUtil.formatDate(juliaFractal.getCreatedAt())}</p>
            <p className='text-small-black'>Modification : {DateUtil.formatDate(juliaFractal.getUpdatedAt())}</p>
            <div className='d-flex align-items-center gap-2'>
                { isAuthenticated && (
                    <Button 
                    onClick={handleAddFractalToUserList} 
                    variant="primary" 
                    className='btn btn-primary-small' 
                    title="Ajouter dans les fractales de l'utilisateur">➕</Button>
                ) }

                <Button variant="primary" className='btn btn-primary-small' title='Dessiner la fractale' onClick={() => setCurrentJuliaFractal(juliaFractal)}>↵</Button>
            </div>
        </div>
    );
};

export default JuliaFractalListElement;