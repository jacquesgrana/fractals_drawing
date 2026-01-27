import { ProgressBar } from "react-bootstrap";
import { MathLibrary } from "../../libraries/MathLibrary";
import { CanvasConfig } from "../../config/CanvasConfig";

interface ZoomPercentProgressBarProps {
    zoomPercent: number;
}

//const ZOOM_MAX = 1000000000000000;
//const ZOOM_DANGER = 1000000000000000;
const ZOOM_WARNING = 1000000000000;

const ZoomPercentProgressBar = (
    { zoomPercent }: ZoomPercentProgressBarProps
): React.ReactElement => {
    
    const getColorVariant = (percent: number): string => {
        if (percent > CanvasConfig.ZOOM_WARNING_LIMIT && percent <= CanvasConfig.ZOOM_DANGER_LIMIT) return "warning";
        if (percent > CanvasConfig.ZOOM_DANGER_LIMIT) return "danger";
        return "success";
    };

    const outValue = (MathLibrary.logBase(10, zoomPercent) / 15 ) * 100;
    //console.log(outValue);
    const formatLabel = (value: number): string => {
        // 'undefined' utilise la locale actuelle du navigateur
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <ProgressBar 
            className="w-100 mt-0 mb-1 zoom-percent-progress-bar"
            now={outValue} 
            label={`${formatLabel(zoomPercent)}%`}
            variant={getColorVariant(zoomPercent)}
            animated
        />
    );
};

export default ZoomPercentProgressBar;
