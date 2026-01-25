import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import { Badge, Button } from 'react-bootstrap';
import DateUtil from '../../utils/DateUtil';
import CanvasService from '../../services/CanvasService';

interface JuliaFractalUserListElementProps {
    juliaFractal: JuliaFractal;
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    handleDeleteJuliaFractal: (fractal: JuliaFractal) => void;
    handleViewJuliaFractal: (juliaFractal: JuliaFractal) => void;
    handleEditJuliaFractal: (juliaFractal: JuliaFractal) => void;
    //isAuthenticated: boolean
}


const JuliaFractalUserListElement: React.FC<JuliaFractalUserListElementProps> = ({ 
    juliaFractal, 
    setCurrentJuliaFractal,
    handleDeleteJuliaFractal,
    handleViewJuliaFractal,
    handleEditJuliaFractal
    //isAuthenticated
 }) => {
    //console.log("juliaFractal", juliaFractal);
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

    return (
        <div className='react-fractal-list-element'>
            <canvas ref={canvasRef} width={160} height={160}></canvas>
            <p className='text-small-black'><strong>{juliaFractal.getName()}</strong></p>
            {/* Affichage conditionnel du badge */}
                {juliaFractal.getIsPublic() ? (
                    <Badge className="badge bg-success" title="Visible par tout le monde">
                        Public
                    </Badge>
                ) : (
                    <Badge className="badge bg-info" title="Visible seulement par vous">
                        Privé
                    </Badge>
                )}
            <div className='d-flex gap-1 w-auto justify-content-center flex-wrap'> 
                <Button 
                type='button'
                className='btn btn-primary-small' 
                title='Voir la fractale'
                onClick={() => handleViewJuliaFractal(juliaFractal)}
                >👁
                </Button>
                <Button 
                type='button'
                className='btn btn-primary-small' 
                title='Modifier la fractale'
                onClick={() => handleEditJuliaFractal(juliaFractal)}
                >✎
                </Button>
                <Button 
                type='button'
                className='btn btn-primary-small' 
                title='Supprimer la fractale'
                onClick={() => handleDeleteJuliaFractal(juliaFractal)}
                >X
                </Button>
                <Button 
                type='button'
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