import React from 'react';
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
        <>
        { isAuthenticated && (
           <div className="react-fractal-list">
                <p 
                onClick={handleToggleIsJuliaFractalUserListPanelOpen}
                className="text-small-black react-text-link-dark"
                >Liste des fractales de Julia de l'utilisateur :</p>
                { isJuliaFractalUserListPanelOpen && (
                    <>  
                        <JuliaFractalUserSortButtons 
                        handleSortClick={handleSortClick}
                        activeSort={activeSort}
                        />
                        <div className="react-fractal-list-container">
                            {juliaFractals.length > 0 && juliaFractals.map((juliaFractal) => (
                                <JuliaFractalUserListElement 
                                key={juliaFractal.getId()} 
                                juliaFractal={juliaFractal} 
                                setCurrentJuliaFractal={setCurrentJuliaFractal}
                                //isAuthenticated={isAuthenticated}
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