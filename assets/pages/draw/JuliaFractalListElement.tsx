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
    handleViewJuliaFractal: (juliaFractal: JuliaFractal) => void;
}


const JuliaFractalListElement: React.FC<JuliaFractalListElementProps> = ({ 
    juliaFractal, 
    setCurrentJuliaFractal,
    isAuthenticated,
    reloadUserJuliaFractals,
    handleViewJuliaFractal
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

    //console.log('jusliaFractal', juliaFractal);
    return (
        <div className='react-fractal-list-element'>
            <p className='text-small-black'><strong>{juliaFractal.getName()}</strong></p>
            <p className='text-small-black'>Création : <br/>{DateUtil.formatDate(juliaFractal.getCreatedAt())}</p>
            <p className='text-small-black'>Modification : <br/>{DateUtil.formatDate(juliaFractal.getUpdatedAt())}</p>
            <div className='d-flex gap-1'>
                { isAuthenticated && (
                    <>
                        <Button 
                        variant="primary" 
                        className='btn btn-primary-small' 
                        title='Voir la fractale'
                        onClick={() => handleViewJuliaFractal(juliaFractal)}
                        >🔍
                        </Button>
                        <Button 
                        onClick={handleAddFractalToUserList} 
                        variant="primary" 
                        className='btn btn-primary-small' 
                        title="Ajouter dans les fractales de l'utilisateur"
                        >+
                        </Button>
                    </>
                ) }

                <Button 
                onClick={() => setCurrentJuliaFractal(juliaFractal)}
                variant="primary" 
                className='btn btn-primary-small' 
                title='Dessiner la fractale' 
                disabled={!isAuthenticated}
                >↵
                </Button>
            </div>
        </div>
    );
};

export default JuliaFractalListElement;