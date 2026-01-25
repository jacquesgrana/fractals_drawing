import React, { useMemo, useState } from 'react';
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
    
    const [activeSort, setActiveSort] = useState<SortOption>('NAME_ASC');

    const sortedFractals = useMemo(() => {
        const listCopy = [...juliaFractals];
        JuliaFractalService.sortListByOption(listCopy, activeSort);
        return listCopy;
    }, [juliaFractals, activeSort]); 


    const handleSortClick = (option: SortOption) => {
        setActiveSort(option);
    };

    return (
        <div className="react-fractal-list mb-2">
            <p 
                onClick={handleToggleIsJuliaFractalListPanelOpen}
                className="text-small-black react-text-link-dark"
                style={{ cursor: 'pointer' }}
            >
                Liste des fractales de Julia publiques :
            </p>
            { isJuliaFractalListPanelOpen && (
                <>  
                    <JuliaFractalPublicSortButtons 
                        handleSortClick={handleSortClick}
                        activeSort={activeSort}
                    />
                    <div className="react-fractal-list-container">
                        {/* On utilise sortedFractals ici au lieu de juliaFractals */}
                        {sortedFractals.length > 0 && sortedFractals.map((juliaFractal) => (
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
