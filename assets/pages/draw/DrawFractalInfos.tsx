import { useEffect, useState } from "react";
import { JuliaFractal } from "../../model/JuliaFractal";
import { MathLibrary } from "../../libraries/MathLibrary";
import ZoomPercentProgressBar from "./ZoomPercentProgressBar";


interface DrawFractalInfosProps {
    zoom: number;
    transX: number;
    transY: number;
    //angle: number,
    canvasCalculationTime: number;
    juliaFractalName: string;
}

const DrawFractalInfos = (
    { zoom, transX, transY, canvasCalculationTime, juliaFractalName }: DrawFractalInfosProps
): React.ReactElement => {
    const zoomPercent = MathLibrary.getZoomPercent(zoom);

    // déplacer dans une librairie
    const formatTime = (ms: number): string => {
        if (ms < 1000) return `${ms.toFixed(2)} ms`;
        return `${(ms / 1000).toFixed(3)} s`;
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center gap-0">
            <div className="react-draw-fractal-infos-container mb-0">
                <p className="text-small-black mb-0">Nom : <strong>{juliaFractalName}</strong></p>
                <p className="text-small-black mb-0">Translation x : {transX.toFixed(8)}, y : {transY.toFixed(8)}</p>
                <p className="text-small-black mb-0">Calcul : {formatTime(canvasCalculationTime)}</p>
            </div>
            <ZoomPercentProgressBar zoomPercent={zoomPercent} />
        </div>
    );
};

export default DrawFractalInfos;

/**
 <p className="text-small-black mb-0">Zoom : {zoomPercent.toFixed(2)}%</p>
 */