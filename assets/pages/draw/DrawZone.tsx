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
    const bufferRef = useRef<Nullable<ImageData>>(null);
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

        maxIRef.current = canvas.width;
        maxJRef.current = canvas.height;

        // 2. Récupération et cache du contexte
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        contextRef.current = ctx;

        // 3. Initialisation du fond noir
        //ctx.fillStyle = "black";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 4. CRITIQUE : On crée le buffer en mémoire UNE SEULE FOIS
        // On récupère l'état initial des pixels
        bufferRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

        canvasService.setCanvas(canvasRef.current!);
        canvasService.setCanvasContext(ctx);
        canvasService.setCanvasWidth(canvasRef.current!.width);
        canvasService.setCanvasHeight(canvasRef.current!.height);
        canvasService.initService();
        canvasService.initTabToDraw();
        canvasService.initImageData();

        drawCanvas();
    }, []);

    const drawCanvas =  useCallback(async () =>  {
        setIsDrawing(true);
        console.log('maxI : ' + maxIRef.current + ' maxJ : ' + maxJRef.current);
        const ctx = contextRef.current;
        const buffer = bufferRef.current; // On récupère notre "ImageData" stocké

        if (!ctx || !buffer) return;

        const data = buffer.data; // Accès direct au tableau Uint8ClampedArray
        
        

        const datasFromService: Color[][] = await canvasService.updateTabToDraw();

        //console.log(datasFromService);


        for (let i = 0; i < datasFromService.length; i++) {
            for (let j = 0; j < datasFromService[0].length; j++) {
                const ii = (j * buffer.width + i) * 4;
                data[ii]     = datasFromService[i][j].getRed(); // R
                data[ii + 1] = datasFromService[i][j].getGreen()   ; // G
                data[ii + 2] = datasFromService[i][j].getBlue(); // B
                data[ii + 3] = datasFromService[i][j].getAlpha(); // Alpha totalement opaque
            }
        }

        ctx.putImageData(buffer, 0, 0);
        setIsDrawing(false);

    }, []); // useCallback pour optimiser la référence de la fonction

    const handleClick = useCallback(() => {
        //canvasService.zoom = canvasService.zoom - 0.25;
        canvasService.currentScene.setZoom(canvasService.currentScene.getZoom() * 0.9);
        //canvasService.currentScene.updateMatrix();
        drawCanvas();
    }, [drawCanvas]);

    return (
    <div>
        
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
            width={800} // Assurez-vous que la taille est fixée
            height={600}
        />
        
        <Button onClick={handleClick}>Dessiner</Button>
    </div>
);
};

export default DrawZone;

/*
i = x * maxI + y
j = x * maxJ + y



const [maxI, setMaxI] = useState(0);
const [maxJ, setMaxJ] = useState(0);

setMaxI(canvas.width);
setMaxJ(canvas.height);
 */