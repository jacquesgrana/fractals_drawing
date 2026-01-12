import { useEffect, useRef, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
// J'assume que tes types sont définis, sinon utilise null | ...
import { Nullable } from "../../types/commonTypes"; 
import CanvasService from "../../services/CanvasService";
import { Color } from "../../model/Color";
import { Point } from "../../model/Point";
import ToastFacade from "../../facade/ToastFacade";

const DrawZone = () : React.ReactElement => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
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

        drawCanvas();
    }, []);

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

    return (
    <div className="draw-zone-container d-flex flex-column align-items-center justify-content-center gap-2">

        {/* Le canvas est TOUJOURS là, jamais de condition !isWaiting devant */}
        <canvas 
            ref={canvasRef} 
            className="draw-zone"
            //width={800} // Assurez-vous que la taille est fixée
            //height={600}
        />
        <div className="d-flex gap-1">
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateRight} title="déplacement vers la gauche">◀</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateLeft} title="déplacement vers la droite">▶</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateUp} title="déplacement vers le haut">▲</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleTranslateDown} title="déplacement vers le bas">▼</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleZoomPlus} title="zoom +">+</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleZoomMoins} title="zoom -">-</Button>
            <Button variant="primary" className="btn btn-small-primary" disabled={isDrawing} onClick={handleReset} title="reset">⎚</Button>
            <Button variant={copySuccess ? "success" : "primary"} className="btn btn-small-primary" disabled={isDrawing} onClick={handleCopyToClipboard} title="copier l'image dans le presse-papier">
                {copySuccess ? (
                    <>
                        ✓
                    </>
                ) : (
                    <>
                        📋
                    </>
                )}
            </Button>
        </div>
        
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