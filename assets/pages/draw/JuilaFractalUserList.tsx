import React, { useMemo, useState } from 'react';
import { JuliaFractal } from '../../model/JuliaFractal';
import JuliaFractalUserListElement from './JuliaFractalUserListElement';
import { SortOption } from '../../types/indexType';
import JuliaFractalService from '../../services/JuliaFractalService';
import JuliaFractalUserSortButtons from './JuliaFractalUserSortButtons';

interface JuliaFractalUserListProps { 
    juliaFractals: JuliaFractal[];
    setCurrentJuliaFractal: (fractal: JuliaFractal) => void;
    isJuliaFractalUserListPanelOpen: boolean;
    handleToggleIsJuliaFractalUserListPanelOpen: () => void;
    isAuthenticated: boolean;
    handleDeleteJuliaFractal: (fractal: JuliaFractal) => void;
    handleViewJuliaFractal: (juliaFractal: JuliaFractal) => void;
    handleEditJuliaFractal: (juliaFractal: JuliaFractal) => void;
}

const JuliaFractalUserList = ({
    juliaFractals,
    setCurrentJuliaFractal,
    isJuliaFractalUserListPanelOpen,
    handleToggleIsJuliaFractalUserListPanelOpen,
    isAuthenticated,
    handleDeleteJuliaFractal,
    handleViewJuliaFractal,
    handleEditJuliaFractal
} : JuliaFractalUserListProps) : React.ReactElement => {
    
    const [activeSort, setActiveSort] = useState<SortOption>('NAME_ASC');

    const sortedFractals = useMemo(() => {
        const listCopy = [...juliaFractals]; // Copie superficielle pour ne pas muter les props
        JuliaFractalService.sortListByOption(listCopy, activeSort);
        return listCopy;
    }, [juliaFractals, activeSort]);

    const handleSortClick = (option: SortOption) => {
        setActiveSort(option);
    };

    return (
        <>
        { isAuthenticated && (
           <div className="react-fractal-list">
                <p 
                    onClick={handleToggleIsJuliaFractalUserListPanelOpen}
                    className="text-small-black react-text-link-dark"
                    style={{ cursor: 'pointer' }}
                >
                    Liste des fractales de Julia de l'utilisateur :
                </p>
                
                { isJuliaFractalUserListPanelOpen && (
                    <>  
                        <JuliaFractalUserSortButtons 
                            handleSortClick={handleSortClick}
                            activeSort={activeSort}
                        />
                        <div className="react-fractal-list-container">
                            {/* 3. ON MAP SUR LA LISTE TRIÉE (sortedFractals) */}
                            {sortedFractals.length > 0 && sortedFractals.map((juliaFractal) => (
                                <JuliaFractalUserListElement 
                                    key={juliaFractal.getId()} 
                                    juliaFractal={juliaFractal} 
                                    setCurrentJuliaFractal={setCurrentJuliaFractal}
                                    handleDeleteJuliaFractal={handleDeleteJuliaFractal}
                                    handleViewJuliaFractal={handleViewJuliaFractal}
                                    handleEditJuliaFractal={handleEditJuliaFractal}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div> 
        )}
        </>
    )
}

export default JuliaFractalUserList;
