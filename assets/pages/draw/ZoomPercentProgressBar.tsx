import { ProgressBar } from "react-bootstrap";
import { MathLibrary } from "../../libraries/MathLibrary";

interface ZoomPercentProgressBarProps {
    zoomPercent: number;
}

const ZoomPercentProgressBar = (
    { zoomPercent }: ZoomPercentProgressBarProps
): React.ReactElement => {
    
    // Optionnel : changer la couleur selon le niveau de zoom
    const getVariant = (percent: number): string => {
        if (percent > 500000 && percent <= 500000000) return "warning";
        if (percent > 500000000) return "danger";
        return "success";
    };

    const outValue = (MathLibrary.logBase(10, zoomPercent) / 10 ) * 100;
    //console.log(outValue);

    return (
        <ProgressBar 
            className="w-100 mt-0 mb-1 zoom-percent-progress-bar"
            now={outValue} 
            label={`${zoomPercent.toFixed(2)}%`}
            variant={getVariant(zoomPercent)}
            animated
        />
    );
};

export default ZoomPercentProgressBar;
