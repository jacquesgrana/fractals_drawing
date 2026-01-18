import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';
import JuliaFractalService from '../../services/JuliaFractalService';
import ToastFacade from '../../facade/ToastFacade';

interface JuliaFractalListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isAuthenticated: boolean;
    reloadUserJuliaFractals: () => Promise<void>;
}


const JuliaFractalListElement: React.FC<JuliaFractalListElementProps> = ({ 
    juliaFractal, 
    setCurrentJuliaFractal,
    isAuthenticated,
    reloadUserJuliaFractals
 }) => {

    const juliaFractalService = JuliaFractalService.getInstance();

    const handleAddFractalToUserList = async () => {
        //console.log('Ajouter la fractale ' + juliaFractal.getName() + ' dans la liste des fractales de l\'utilisateur');
        const response = await juliaFractalService.addJuliaFractalToUserList(juliaFractal);

        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de l\'ajoût de la fractale !');
            return;
        }
        try {
            const data = await response.json();
            if (data.status === 200) {
                ToastFacade.success('Ajoût réussi : ' + data.message + ' !');
                //await juliaFractalService.initService();
                await reloadUserJuliaFractals();
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
            }
        }
        catch (error) {
            ToastFacade.error('Erreur : Erreur lors de l\'ajoût de la fractale !');
        }
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