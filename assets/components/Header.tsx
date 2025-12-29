import React from 'react';
import { Link } from 'react-router-dom';

const Header = () : React.ReactElement => {
    return(
   <nav id="react-header">
        {/* Attention: Utilise <Link> et non <a href> pour ne pas recharger la page */}
        <Link className="react-link" to="/">Accueil</Link>
        <Link className="react-link" to="/draw">Dessin</Link>
        <Link className="react-link" to="/login">Login</Link>
    </nav>
);
};
export default Header;