import React from 'react';
import { Button } from 'react-bootstrap';
import { SortOption } from '../../types/indexType';

type JuliaFractalPublicSortButtonsProps = {
    handleSortClick: (option: SortOption) => void,
    activeSort: SortOption
}
const JuliaFractalPublicSortButtons = (
    {
        handleSortClick,
        activeSort
    } : JuliaFractalPublicSortButtonsProps
) : React.ReactElement => {
    //const [activeSort, setActiveSort] = React.useState<SortOption>('NAME_ASC');

    const getButtonClass = (option: SortOption) => {
        return activeSort === option 
            ? "btn btn-primary-selected btn-sm"  // Style "Actif"
            : "btn btn-primary btn-sm"; // Style "Inactif"
    };
    
    return (
        <div className="react-fractal-list-panel mb-2">
            <div className="btn-group d-flex gap-1 w-100" role="group" aria-label="Filtres de liste">

                <Button 
                    type="button" 
                    className={getButtonClass('NAME_ASC')}
                    onClick={() => handleSortClick('NAME_ASC')}
                    title="Trier par nom croissant"
                >
                    Nom ⬆
                </Button>
                <Button 
                    type="button" 
                    className={getButtonClass('NAME_DESC')}
                    onClick={() => handleSortClick('NAME_DESC')}
                    title="Trier par nom décroissant"
                >
                    Nom ⬇
                </Button>
                <Button 
                    type="button" 
                    className={getButtonClass('LIKES_ASC')}
                    onClick={() => handleSortClick('LIKES_ASC')}
                    title="Trier par likes croissant"
                >
                    Likes ⬆
                </Button>
                <Button 
                    type="button" 
                    className={getButtonClass('LIKES_DESC')}
                    onClick={() => handleSortClick('LIKES_DESC')}
                    title="Trier par likes décroissant"
                >
                    Likes ⬇
                </Button>
                <Button 
                    type="button" 
                    className={getButtonClass('CREATION_RECENT')}
                    onClick={() => handleSortClick('CREATION_RECENT')}
                    title="Trier par date de création croissante"
                >
                    Créées ⬆
                </Button>
                
                <Button 
                    type="button" 
                    className={getButtonClass('CREATION_OLD')}
                    onClick={() => handleSortClick('CREATION_OLD')}
                    title="Trier par date de création décroissante"
                >
                    Créées ⬇
                </Button>

                <Button 
                    type="button" 
                    className={getButtonClass('UPDATE_RECENT')}
                    onClick={() => handleSortClick('UPDATE_RECENT')}
                    title="Trier par date de modification croissante"
                >
                    Modifiées ⬆
                </Button>

                <Button 
                    type="button" 
                    className={getButtonClass('UPDATE_OLD')}
                    onClick={() => handleSortClick('UPDATE_OLD')}
                    title="Trier par date de modification décroissante"
                >
                    Modifiées ⬇
                </Button>
            </div>
        </div>
    );
}

export default JuliaFractalPublicSortButtons;

/*
                    
*/