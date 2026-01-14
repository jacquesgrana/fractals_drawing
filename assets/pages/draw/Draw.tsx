import React, { useEffect } from 'react';
import DrawZone from './DrawZone';
import JuliaFractalList from './JuliaFractalList';
import JuliaFractalService from '../../services/JuliaFractalService';
import { JuliaFractal } from '../../model/JuliaFractal';
import CanvasService from '../../services/CanvasService';
import { Nullable } from '../../types/indexType';

const Draw = () : React.ReactElement => {
    const [isLoadingJuliaFractals, setIsLoadingJuliaFractals] = React.useState<boolean>(false);
    const [juliaFractals, setJuliaFractals] = React.useState<JuliaFractal[]>([]);
    // 1. Nouvel état pour stocker celle qu'on a cliqué
    const [selectedJuliaFractal, setSelectedJuliaFractal] = React.useState<Nullable<JuliaFractal>>(null);
    const juliaFractalService = JuliaFractalService.getInstance();
    //const canvasService = CanvasService.getInstance();

    useEffect(() => {
        const init = async () => {
            setIsLoadingJuliaFractals(true);
            await juliaFractalService.initService();
            setJuliaFractals(juliaFractalService.getPublicJuliaFractals());
            setCurrentJuliaFractal(juliaFractalService.getPublicJuliaFractals()[0]);
            setIsLoadingJuliaFractals(false);
        }
        init();
    }, []);

    const setCurrentJuliaFractal = (juliaFractal: JuliaFractal) => {
        //console.log("set current julia fractal: " + juliaFractal);
        setSelectedJuliaFractal(juliaFractal);
        //canvasService.setJuliaFractal(juliaFractal);
    }

    return (
        <div className="react-card draw-page">
            <h2>Page de dessin</h2>
            <p>Bienvenue !</p>
            <DrawZone selectedJuliaFractal={selectedJuliaFractal} />
            { isLoadingJuliaFractals && (
                <p>Chargement des fractales...</p>
            )}
            { !isLoadingJuliaFractals && juliaFractals.length > 0 && (
                <JuliaFractalList
                juliaFractals ={juliaFractals} 
                setCurrentJuliaFractal={setCurrentJuliaFractal}
                />
            )}
            
        </div>
    );
};
export default Draw;
