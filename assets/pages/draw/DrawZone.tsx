import { useEffect, useRef, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
// J'assume que tes types sont définis, sinon utilise null | ...
import { Nullable } from "../../types/commonTypes"; 
import CanvasService from "../../services/CanvasService";
import { Color } from "../../model/Color";

const DrawZone = () : React.ReactElement => {
    const [isDrawing, setIsDrawing] = useState(false);
    // On garde uniquement les états liés à l'UI
    // Pas de maxI, maxJ ou context dans le State !
    
    // REFS : Stockage mutable persistant sans re-render
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<Nullable<CanvasRenderingContext2D>>(null);
    //const bufferRef = useRef<Nullable<ImageData>>(null);
    const maxIRef = useRef(0);
    const maxJRef = useRef(0);

    const canvasService = CanvasService.getInstance();

    // Initialisation unique
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Configuration de la taille réelle (Résolution)
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        maxIRef.current = canvas.width; // enlever ?
        maxJRef.current = canvas.height;

        // 2. Récupération et cache du contexte
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        contextRef.current = ctx;

        // 4. Initialisation du service

        canvasService.setCanvas(canvasRef.current!);
        canvasService.setCanvasContext(ctx);
        canvasService.setCanvasWidth(canvasRef.current!.width);
        canvasService.setCanvasHeight(canvasRef.current!.height);
        canvasService.initService();
        canvasService.initTabToDraw();
        canvasService.initImageData();

        //canvasService.setBuffer(ctx.getImageData(0, 0, canvas.width, canvas.height));

        drawCanvas();
    }, []);

    /*
    const drawCanvas =  useCallback(async () =>  {
        setIsDrawing(() => true);
        const ctx = canvasService.getCanvasContext();
        const buffer = canvasService.getBuffer();
        if (!ctx || !buffer) return;

        const data = buffer.data; // Accès direct au tableau Uint8ClampedArray
        const datasFromService: Color[][] = await canvasService.getTabToDraw();

        for (let i = 0; i < datasFromService.length; i++) {
            for (let j = 0; j < datasFromService[0].length; j++) {
                const k = (j * buffer.width + i) * 4;
                data[k]     = datasFromService[i][j].getRed(); // R
                data[k + 1] = datasFromService[i][j].getGreen(); // G
                data[k + 2] = datasFromService[i][j].getBlue(); // B
                data[k + 3] = datasFromService[i][j].getAlpha(); // Alpha
            }
        }

        ctx.putImageData(buffer, 0, 0);
        setIsDrawing(() => false);

    }, []); // useCallback pour optimiser la référence de la fonction
    */

    const drawCanvas = useCallback(async () => {
        setIsDrawing(true);
        await canvasService.computeFractalToBuffer();
        canvasService.drawBufferToCanvas();
        setIsDrawing(false);
    }, []);

    const handleZoomPlus = useCallback(() => {
        //canvasService.zoom = canvasService.zoom - 0.25;
        canvasService.currentScene.setZoom(canvasService.currentScene.getZoom() * 0.9);
        //canvasService.currentScene.updateMatrix();
        drawCanvas();
    }, []);

    const handleZoomMoins = useCallback(() => {
        //canvasService.zoom = canvasService.zoom + 0.25;
        canvasService.currentScene.setZoom(canvasService.currentScene.getZoom() / 0.9);
        //canvasService.currentScene.updateMatrix();
        drawCanvas();
    }, []);

    const handleTranslateLeft = useCallback(() => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setX(trans.getX() - deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        drawCanvas();
    }, []);

    const handleTranslateRight = useCallback(() => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setX(trans.getX() + deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        drawCanvas();
    }, []);

    const handleTranslateUp = useCallback(() => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setY(trans.getY() - deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        drawCanvas();
    }, []);

    const handleTranslateDown = useCallback(() => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setY(trans.getY() + deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        drawCanvas();   
    }, []);

    const handleRotateTrigonometry = useCallback(() => {
        canvasService.currentScene.setAngle(canvasService.currentScene.getAngle() - 10);
        drawCanvas();
    }, []);

    const handleRotateReverseTrigonometry = useCallback(() => {
        canvasService.currentScene.setAngle(canvasService.currentScene.getAngle() + 10);
        drawCanvas();
    }, []);

    return (
    <div className="draw-zone-container d-flex flex-column align-items-center justify-content-center gap-2">
        
        {/* Le message de chargement se superpose via CSS */}
        {isDrawing && (
            <div style={{
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)'
            }}>
                En attente...
            </div>
        )}

        {/* Le canvas est TOUJOURS là, jamais de condition !isWaiting devant */}
        <canvas 
            ref={canvasRef} 
            className="draw-zone"
            //width={800} // Assurez-vous que la taille est fixée
            //height={600}
        />
        <div className="d-flex gap-1">
            <Button className="btn" onClick={handleTranslateRight}>◀</Button>
            <Button className="btn" onClick={handleTranslateLeft}>▶</Button>
            <Button className="btn" onClick={handleTranslateUp}>▲</Button>
            <Button className="btn" onClick={handleTranslateDown}>▼</Button>
            <Button className="btn" onClick={handleZoomPlus}>➕</Button>
            <Button className="btn" onClick={handleZoomMoins}>➖</Button>
        </div>
        
    </div>
);
};

export default DrawZone;

/*
<Button className="btn" onClick={handleRotateTrigonometry}>↺</Button>
<Button className="btn" onClick={handleRotateReverseTrigonometry}>↻</Button>

↺
↻
i = x * maxI + y
j = x * maxJ + y



const [maxI, setMaxI] = useState(0);
const [maxJ, setMaxJ] = useState(0);

setMaxI(canvas.width);
setMaxJ(canvas.height);
 */