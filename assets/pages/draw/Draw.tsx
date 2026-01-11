import React from 'react';
import DrawZone from './DrawZone';

const Draw = () : React.ReactElement => {
    return (
    <div className="react-card draw-page">
        <h2>Page de dessin</h2>
        <p>Bienvenue !</p>
        <DrawZone />
    </div>
);
};
export default Draw;
