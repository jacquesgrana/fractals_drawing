
import React from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import JuliaFractalListElement from './JuliaFractalListElement';
import { SortOption } from '../../types/indexType';
import JuliaFractalPublicSortButtons from './JuliaFractalPublicSortButtons';
import JuliaFractalService from '../../services/JuliaFractalService';

interface JuliaFractalPublicListProps {
    juliaFractals: JuliaFractal[];
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isJuliaFractalListPanelOpen: boolean;
    handleToggleIsJuliaFractalListPanelOpen: () => void;
    isAuthenticated: boolean;
    reloadUserJuliaFractals: () => Promise<void>;
    handleViewJuliaFractal: (juliaFractal: JuliaFractal) => void;
}

const JuliaFractalPublicList = ({ 
    juliaFractals, 
    setCurrentJuliaFractal,
    isJuliaFractalListPanelOpen,
    handleToggleIsJuliaFractalListPanelOpen,
    isAuthenticated,
    reloadUserJuliaFractals,
    handleViewJuliaFractal
} : JuliaFractalPublicListProps ) : React.ReactElement => {
    const [activeSort, setActiveSort] = React.useState<SortOption>('NAME_ASC');

    React.useEffect(() => {
        handleSortClick(activeSort);
    }, []);

    const handleSortClick = (option: SortOption) => {
        setActiveSort(option);
        //console.log("Option choisie :", option);
        JuliaFractalService.sortListByOption(juliaFractals, option);
    };

    return (
        <div className="react-fractal-list mb-2">
            <p 
            onClick={handleToggleIsJuliaFractalListPanelOpen}
            className="text-small-black react-text-link-dark"
            >Liste des fractales de Julia publiques :</p>
            { isJuliaFractalListPanelOpen && (
                <>  
                    <JuliaFractalPublicSortButtons 
                    handleSortClick={handleSortClick}
                    activeSort={activeSort}
                    />
                    <div className="react-fractal-list-container">
                    {juliaFractals.length > 0 && juliaFractals.map((juliaFractal) => (
                        <JuliaFractalListElement 
                        key={juliaFractal.getId()} 
                        juliaFractal={juliaFractal} 
                        setCurrentJuliaFractal={setCurrentJuliaFractal}
                        isAuthenticated={isAuthenticated}
                        reloadUserJuliaFractals={reloadUserJuliaFractals}
                        handleViewJuliaFractal={handleViewJuliaFractal}
                        />
                    ))}
                    </div>
                </>
            ) }
            
        </div>
    );
};

export default JuliaFractalPublicList;


