export type JuliaFractalParams = {
    seedReal: number,
    seedImag: number,
    maxIter: number,
    limit: number
}

export type SortOption = 'CREATION_RECENT' | 'CREATION_OLD' | 'UPDATE_RECENT' | 'UPDATE_OLD' | 'NAME_ASC' | 'NAME_DESC';