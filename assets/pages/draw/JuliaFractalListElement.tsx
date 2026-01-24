import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';
import JuliaFractalService from '../../services/JuliaFractalService';
import ToastFacade from '../../facade/ToastFacade';
import CanvasService from '../../services/CanvasService';

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
    const canvasService = CanvasService.getInstance();
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (canvasRef.current !== null && juliaFractal) {
            drawCanvas();
        }
    }, [juliaFractal]);

    const drawCanvas = async () =>  {
        if(canvasRef.current === null) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        if (!juliaFractal) return;
        let buffer: ImageData = await canvasService.computeBufferWithWorker(juliaFractal, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(buffer, 0, 0);
    }
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
            <canvas ref={canvasRef} width={160} height={160}></canvas>
            <p className='text-small-black'><strong>{juliaFractal.getName()}</strong></p>
            
            <div className='d-flex gap-1 w-auto'>
                <Button 
                type='button'
                className='btn btn-primary-small' 
                title='Voir la fractale'
                onClick={() => handleViewJuliaFractal(juliaFractal)}
                >👁
                </Button>
                { isAuthenticated && (
                    <>
                        <Button 
                        type='button'
                        onClick={handleAddFractalToUserList} 
                        className='btn btn-primary-small' 
                        title="Ajouter dans les fractales de l'utilisateur"
                        >+
                        </Button>
                    </>
                ) }

                <Button 
                type='button'
                onClick={() => setCurrentJuliaFractal(juliaFractal)}
                className='btn btn-primary-small' 
                title='Dessiner la fractale' 
                >↵
                </Button>
            </div>
        </div>
    );
};

export default JuliaFractalListElement;