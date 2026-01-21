import { useEffect, useRef, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import { Nullable } from "../../types/commonTypes"; 
import CanvasService from "../../services/CanvasService";
//import { Color } from "../../model/Color";
import { Point } from "../../model/Point";
import ToastFacade from "../../facade/ToastFacade";
import { Pixel } from "../../model/Pixel";
import { GraphicLibrary } from "../../libraries/GraphicLibrary";
import { JuliaFractal } from "../../model/JuliaFractal";
import DrawFractalInfos from "./DrawFractalInfos";
import ColorManagementSliders from "./ColorManagementSliders";
import JuliaFractalManagementSliders from "./JuliaFractalManagementSliders";

interface DrawZoneProps {
    selectedJuliaFractal: Nullable<JuliaFractal>;
}

const DrawZone = (
    { selectedJuliaFractal }: DrawZoneProps 
) : React.ReactElement => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [dragStart, setDragStart] = useState<Nullable<Pixel>>(null);
    const [dragEnd, setDragEnd] = useState<Nullable<Pixel>>(null);
    const [isDragging, setIsDragging] = useState(false);

    // ⭐ AJOUT : States pour tracker les valeurs de la scène
    const [zoom, setZoom] = useState<number>(1.5);
    const [transX, setTransX] = useState<number>(0);
    const [transY, setTransY] = useState<number>(0);
    const [juliaFractalName, setJuliaFractalName] = useState<string>("");
    const [canvasCalculationTime, setCanvasCalculationTime] = useState<number>(0);

    const [gradientStart, setGradientStart] = useState<number>(0);
    const [gradientEnd, setGradientEnd] = useState<number>(0);

    const [fractalSeedReal, setFractalSeedReal] = useState<number>(0);
    const [fractalSeedImag, setFractalSeedImag] = useState<number>(0);
    const [fractalMaxIter, setFractalMaxIter] = useState<number>(100);
    const [fractalLimit, setFractalLimit] = useState<number>(2);

    const [isJuliaFractalManagementPanelOpen, setIsJuliaFractalManagementPanelOpen] = useState<boolean>(false);
    const [isColorManagementPanelOpen, setIsColorManagementPanelOpen] = useState<boolean>(false);
    
    // REFS : Stockage mutable persistant sans re-render
    const canvasRef = useRef<HTMLCanvasElement>(null);
    //const contextRef = useRef<Nullable<CanvasRenderingContext2D>>(null);
    //const bufferRef = useRef<Nullable<ImageData>>(null);
    //const maxIRef = useRef(0);
    //const maxJRef = useRef(0);

    const canvasService = CanvasService.getInstance();

    

    // Initialisation unique
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Configuration de la taille réelle (Résolution)
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        //maxIRef.current = canvas.width; // enlever ?
        //maxJRef.current = canvas.height;

        // 2. Récupération et cache du contexte
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        //contextRef.current = ctx;

        // 4. Initialisation du service

        canvasService.setCanvas(canvasRef.current!);
        canvasService.setCanvasContext(ctx);
        canvasService.setCanvasWidth(canvasRef.current!.width);
        canvasService.setCanvasHeight(canvasRef.current!.height);
        canvasService.initService();
        //canvasService.initTabToDraw();
        //canvasService.initImageData();

        //canvasService.setBuffer(ctx.getImageData(0, 0, canvas.width, canvas.height));
        updateSceneInfos();
        drawCanvas();
    }, []);

    useEffect(() => {
        if (selectedJuliaFractal) {
            canvasService.setJuliaFractal(selectedJuliaFractal);
            handleReset();
            drawCanvas();
        }
    }, [selectedJuliaFractal]);

    useEffect(() => {
        if (!isDragging || !dragStart) return;

        const handleMouseMove = (event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calcul des coordonnées relatives au canvas
        const rect = canvas.getBoundingClientRect();
        const i = event.clientX - rect.left;
        const j = event.clientY - rect.top;

        // Création du pixel avec conversion Y
        const pixel = new Pixel(i, j);
        // Note: Ne pas faire pixel.setJ(pixel.getJToDraw(...)) ici car on veut les coordonnées canvas directes
        
        // Mise à jour de l'état
        setDragEnd(pixel);

        // ⚠️ Important: Redessiner d'abord le buffer pour effacer l'ancien rectangle
        canvasService.drawBufferToCanvas();
        
        // Puis dessiner le nouveau rectangle de sélection
        canvasService.drawSelectionRectangle(dragStart, pixel);
        };

        // Utiliser le canvas comme cible pour éviter les problèmes de coordonnées
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDragging, dragStart]); // ⚠️ Ajout de dragStart dans les dépendances

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isDragging) {
                setIsDragging(false);
                setDragStart(null);
                setDragEnd(null);
                canvasService.drawBufferToCanvas();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isDragging]);

    // ⭐ FONCTION UTILITAIRE : Synchroniser les states avec canvasService
    const updateSceneInfos = useCallback(() => {
        setZoom(canvasService.currentScene.getZoom());
        setTransX(canvasService.currentScene.getTrans().getX());
        setTransY(canvasService.currentScene.getTrans().getY());
        setJuliaFractalName(canvasService.getJuliaFractal()?.getName() || "");
        setCanvasCalculationTime(canvasService.canvasCalculationTime);
        setGradientStart(canvasService.gradientStart);
        setGradientEnd(canvasService.gradientEnd);
        setFractalSeedReal(canvasService.getJuliaFractal()?.getSeed().getReal() || 0);
        setFractalSeedImag(canvasService.getJuliaFractal()?.getSeed().getImag() || 0);
        setFractalLimit(canvasService.getJuliaFractal()?.getLimit() || 0);
        setFractalMaxIter(canvasService.getJuliaFractal()?.getMaxIt() || 0);
    }, [canvasService]);    

    const drawCanvas = useCallback(async () => {
        // Si on est déjà en train de dessiner, on ignore les nouveaux clics (anti-spam)
        if (isDrawing) return; 

        setIsDrawing(true);
        
        // On laisse React faire le rendu du state "isDrawing" (pour afficher le loader)
        // avant de lancer le calcul lourd (même s'il est dans un worker, c'est une bonne pratique)
        requestAnimationFrame(async () => {
            try {
                // 1. Calcul dans le thread séparé (Worker)
                await canvasService.computeFractal();
                
                // 2. Une fois fini, on peint le résultat
                canvasService.drawBufferToCanvas();
                updateSceneInfos();
            } catch (e) {
                console.error(e);
            } finally {
                setIsDrawing(false);
            }
        });
    }, [isDrawing, canvasService]); // Ajout dépendances

    /*
    // méthode qui fonctionne bien mais blocante
    const drawCanvas = useCallback(async () => {
        setIsDrawing(true);
        await canvasService.computeFractalToBuffer();
        canvasService.drawBufferToCanvas();
        setIsDrawing(false);
    }, []);
    */
    
    /*
    const drawCanvas = useCallback(async () => {
        if (isDrawing) return; // Empêche les clics frénétiques

        setIsDrawing(true);
        try {
            // Le calcul se fait dans le thread séparé
            await canvasService.computeFractal();
            // L'affichage est instantané
            canvasService.drawBufferToCanvas();
        } catch (error) {
            console.error("Erreur de calcul worker:", error);
        } finally {
            setIsDrawing(false);
        }
    }, [isDrawing]);*/

    const HandleToggleIsJuliaFractalManagementPanelOpen = useCallback(() => {
        setIsJuliaFractalManagementPanelOpen(!isJuliaFractalManagementPanelOpen);
    }, [isJuliaFractalManagementPanelOpen]);

    const HandleToggleIsColorManagementPanelOpen = useCallback(() => {
        setIsColorManagementPanelOpen(!isColorManagementPanelOpen);
    }, [isColorManagementPanelOpen]);

    const handleZoomPlus = useCallback(async () => {
        //canvasService.zoom = canvasService.zoom - 0.25;
        canvasService.currentScene.setZoom(canvasService.currentScene.getZoom() * 0.9);
        //canvasService.currentScene.updateMatrix();
        await drawCanvas();
    }, []);

    const handleZoomMoins = useCallback(async () => {
        //canvasService.zoom = canvasService.zoom + 0.25;
        canvasService.currentScene.setZoom(canvasService.currentScene.getZoom() / 0.9);
        //canvasService.currentScene.updateMatrix();
        await drawCanvas();
    }, []);

    const handleTranslateLeft = useCallback(async () => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setX(trans.getX() + deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        await drawCanvas();
    }, []);

    const handleTranslateRight = useCallback(async () => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setX(trans.getX() - deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        await drawCanvas();
    }, []);

    const handleTranslateUp = useCallback(async () => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setY(trans.getY() + deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        await drawCanvas();
    }, []);

    const handleTranslateDown = useCallback(async () => {
        const trans = canvasService.currentScene.getTrans();
        const deltaFromZoom = canvasService.currentScene.getZoom() * 0.25;
        trans.setY(trans.getY() - deltaFromZoom);
        canvasService.currentScene.setTrans(trans);
        await drawCanvas();   
    }, []);

    const handleReset = useCallback(async () => {
        //this.angle = 0;
        //this.zoom = 1.5;
        //this.trans = new Point(0, 0);
        canvasService.currentScene.setAngle(0);
        canvasService.currentScene.setZoom(1.5);
        canvasService.currentScene.setTrans(new Point(0, 0));
        await drawCanvas();
    }, []);

    const handleCopyToClipboard = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            // 1. Convertir le canvas en Blob (format PNG par défaut)
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/png');
            });

            if (!blob) {
                console.error("Impossible de générer l'image du canvas");
                return;
            }

            // 2. Créer l'item pour le presse-papier
            // Le type MIME doit correspondre au blob créé
            const item = new ClipboardItem({ "image/png": blob });

            // 3. Écrire dans le presse-papier
            await navigator.clipboard.write([item]);

            // 4. Feedback utilisateur
            ToastFacade.success("Image copiée dans le presse-papier.");
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000); // Reset après 2 secondes

        } catch (err) {
            console.error("Erreur lors de la copie dans le presse-papier :", err);
            alert("Erreur: Impossible de copier l'image (Navigateur non supporté ou contexte non sécurisé ?)");
        }
    }, []);


    const handleRotateTrigonometry = useCallback(async () => {
        canvasService.currentScene.setAngle(canvasService.currentScene.getAngle() - 10);
        await drawCanvas();
    }, []);

    const handleRotateReverseTrigonometry = useCallback(async () => {
        canvasService.currentScene.setAngle(canvasService.currentScene.getAngle() + 10);
        await drawCanvas();
    }, []);

    const handleMouseDown = useCallback(async (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    //console.log("handleMouseDown");
    
    const i = event.nativeEvent.offsetX;
    const j = event.nativeEvent.offsetY;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = new Pixel(i, j);
    
    if (event.button === 1) { // Molette
        //console.log("Molette - Centrer");
        pixel.setJ(pixel.getJToDraw(canvas.height));
        const point = GraphicLibrary.calcPointFromPix(
            pixel, 
            canvasService.currentScene, 
            canvas.width, 
            canvas.height
        );
        canvasService.currentScene.setTrans(point);
        await drawCanvas();
    }
    else if (event.button === 0) { // Clic gauche
        //console.log("Clic gauche - Début drag");
        // Note: Ne pas convertir le J ici, on travaille en coordonnées canvas
        setDragStart(pixel);
        setDragEnd(pixel);
        setIsDragging(true);
    }
}, []);


    const handleMouseUp = useCallback(async (event: React.MouseEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        //console.log("handleMouseUp");
        
        if (event.button !== 0) return; // Seulement pour le clic gauche
        
        const i = event.nativeEvent.offsetX;
        const j = event.nativeEvent.offsetY;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pixel = new Pixel(i, j);
        //pixel.setJ(pixel.getJToDraw(canvas.height));
        
        setDragEnd(pixel);
        setIsDragging(false);

        // Si le drag est trop petit, on ignore (évite les clics accidentels)
        if (dragStart && Math.abs(i - dragStart.getI()) > 5 && Math.abs(j - dragStart.getJ()) > 5) {
            // Efface le rectangle de sélection
            canvasService.drawBufferToCanvas();
            
            // TODO : Appeler la méthode de zoom sur la zone
            await handleZoomOnSelection(dragStart, pixel);
            setDragStart(null);
            setDragEnd(null);
            setIsDragging(false);
        } else {
            // Simple clic, pas de zoom
            canvasService.drawBufferToCanvas();
        }
        
        // Reset
        setDragStart(null);
        setDragEnd(null);
    }, [dragStart]);



    const handleMouseMove = useCallback(async (event: React.MouseEvent<HTMLCanvasElement>) => {
        //setIsDrawing(true);
        event.preventDefault();
        if(isDragging) {
            const i = event.nativeEvent.offsetX;
            const j = event.nativeEvent.offsetY;
            //console.log("handleMouseMove");
        }
    }, []);

    const handleZoomOnSelection = useCallback(async (start: Pixel, end: Pixel) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // affecter dans start et end les min et max des pixels
        if (start.getI() > end.getI() || start.getJ() > end.getJ()) {
            const tmp = start;
            start = end;
            end = tmp;
        }

        start.setJ(start.getJToDraw(canvas.height));
        end.setJ(end.getJToDraw(canvas.height));
        // Convertir les pixels en points du plan complexe
        const startPoint = GraphicLibrary.calcPointFromPix(
            start, 
            canvasService.currentScene, 
            canvas.width, 
            canvas.height
        );

        const endPoint = GraphicLibrary.calcPointFromPix(
            end, 
            canvasService.currentScene, 
            canvas.width, 
            canvas.height
        );

        // Calculer le centre de la sélection
        const centerX = (startPoint.getX() + endPoint.getX()) / 2;
        const centerY = (startPoint.getY() + endPoint.getY()) / 2;

        // Calculer la largeur de la sélection dans le plan complexe
        const selectionWidth = Math.abs(endPoint.getX() - startPoint.getX());
        
        // ⭐ CALCUL DYNAMIQUE : largeur actuelle basée sur les coins actuels du canvas
        // Calculer les points aux coins du canvas
        const topLeftPixel = new Pixel(0, 0);
        const topRightPixel = new Pixel(canvas.width, 0);
        
        const topLeftPoint = GraphicLibrary.calcPointFromPix(
            topLeftPixel,
            canvasService.currentScene,
            canvas.width,
            canvas.height
        );
        
        const topRightPoint = GraphicLibrary.calcPointFromPix(
            topRightPixel,
            canvasService.currentScene,
            canvas.width,
            canvas.height
        );
        
        // La largeur réelle actuelle de la scène visible
        const currentSceneWidth = Math.abs(topRightPoint.getX() - topLeftPoint.getX());
        
        // Le rapport entre la sélection et la scène complète
        // Si on sélectionne 1/4 de l'écran, on veut zoomer 4x plus
        const zoomRatio = selectionWidth / currentSceneWidth;
        
        // Le nouveau zoom : plus petit = plus zoomé
        // Si zoomRatio = 0.25 (1/4 de l'écran), le nouveau zoom sera currentZoom * 0.25
        const currentZoom = canvasService.currentScene.getZoom();
        const newZoom = currentZoom * zoomRatio;

        //console.log(`Zoom: ${currentZoom} -> ${newZoom} (ratio: ${zoomRatio})`);

        // Appliquer les transformations
        canvasService.currentScene.setTrans(new Point(centerX, centerY));
        canvasService.currentScene.setZoom(newZoom);

        // Redessiner
        await drawCanvas();
    }, [drawCanvas]);

    const handleChangeGradientStart = async (value: number) => {
        setGradientStart(value);
        canvasService.gradientStart = value;
        await drawCanvas();
    };
    const handleChangeGradientEnd = async (value: number) => {
        setGradientEnd(value);
        canvasService.gradientEnd = value;
        await drawCanvas();
    };  

    const handleChangeJuliaFractalSeedReal = async (value: number) => {
        setFractalSeedReal(value);
        canvasService.getJuliaFractal().getSeed().setReal(value);
        await drawCanvas();
    }

    const handleChangeJuliaFractalSeedImag = async (value: number) => {
        setFractalSeedImag(value);
        canvasService.getJuliaFractal().getSeed().setImag(value);
        await drawCanvas();
    }

    const handleChangeJuliaFractalMaxIter = async (value: number) => {
        setFractalMaxIter(value);
        canvasService.getJuliaFractal().setMaxIt(value);
        await drawCanvas();
    }

    const handleChangeJuliaFractalLimit = async (value: number) => {
        setFractalLimit(value);
        canvasService.getJuliaFractal().setLimit(value);
        await drawCanvas();
    }

    return (
    <div className="draw-zone-container">

        {/* Le canvas est TOUJOURS là, jamais de condition !isWaiting devant */}
        <canvas 
            ref={canvasRef} 
            className="draw-zone"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            //onMouseMove={handleMouseMove}
        />
        <DrawFractalInfos 
            zoom={zoom}
            transX={transX}
            transY={transY}
            juliaFractalName={juliaFractalName} 
            canvasCalculationTime={canvasCalculationTime}
        />

        <div className="d-flex gap-1 mb-2">
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateRight} title="déplacement vers la gauche">◀</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateLeft} title="déplacement vers la droite">▶</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateUp} title="déplacement vers le haut">▲</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateDown} title="déplacement vers le bas">▼</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleZoomPlus} title="zoom +">+</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleZoomMoins} title="zoom -">-</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleReset} title="reset">⎚</Button>
            <Button variant={copySuccess ? "success" : "primary"} className="btn btn-small-primary" disabled={isDrawing} onClick={handleCopyToClipboard} title="copier l'image dans le presse-papier">
                {copySuccess ? (<>✓</>) : (<>📋</>)}
            </Button>
        </div>

        <JuliaFractalManagementSliders 
            fractalSeedReal={fractalSeedReal}
            fractalSeedImag={fractalSeedImag}
            fractalMaxIter={fractalMaxIter}
            fractalLimit={fractalLimit}
            handleChangeJuliaFractalSeedReal={handleChangeJuliaFractalSeedReal}
            handleChangeJuliaFractalSeedImag={handleChangeJuliaFractalSeedImag}
            handleChangeJuliaFractalMaxIter={handleChangeJuliaFractalMaxIter}
            handleChangeJuliaFractalLimit={handleChangeJuliaFractalLimit}
            isJuliaFractalManagementPanelOpen={isJuliaFractalManagementPanelOpen}
            HandleToggleIsJuliaFractalManagementPanelOpen={HandleToggleIsJuliaFractalManagementPanelOpen}   
        />

        <ColorManagementSliders 
            gradientStart={gradientStart}
            gradientEnd={gradientEnd}
            handleChangeGradientStart={handleChangeGradientStart}
            handleChangeGradientEnd={handleChangeGradientEnd}
            isColorManagementPanelOpen={isColorManagementPanelOpen}
            HandleToggleIsColorManagementPanelOpen={HandleToggleIsColorManagementPanelOpen}
        />
        
        
    </div>
);
};

export default DrawZone;

/*
<Button className="btn" onClick={handleRotateTrigonometry}>↺</Button>
<Button className="btn" onClick={handleRotateReverseTrigonometry}>↻</Button>
➕ ➖
↺
↻
i = x * maxI + y
j = x * maxJ + y



const [maxI, setMaxI] = useState(0);
const [maxJ, setMaxJ] = useState(0);

setMaxI(canvas.width);
setMaxJ(canvas.height);
 */