import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles/app.scss'; // Ton SCSS

import Home from './pages/home/Home';
import Draw from './pages/draw/Draw';
import Login from './pages/login/Login';
import Header from './layout/Header';
import Footer from './layout/Footer';
import SecurityService from './services/SecurityService';
import { Toaster } from 'react-hot-toast';

const ReactBody = ({ name }: { name: string }) => {

    const securityService = SecurityService.getInstance();

    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // On appelle l'endpoint qu'on vient de créer
                const response = await securityService.me();

                
                if(response) {
                    if (response.status === 200) {
                        //console.log(response)
                        //const userData = await response.json();
                        
                        // C'est ici que tu mets à jour ton observable !
                        // Exemple : authService.setUser(userData);
                        // Exemple : authService.setIsAuthenticated(true);
                        //console.log('Utilisateur restauré : ', securityService.getUser()?.email);
                    } else {
                        //console.log('Pas de session active');
                        // Optionnel : Forcer la déco dans le service si besoin
                    }
                }
                    
                
            } catch (error) {
                console.error('Erreur API', error);
            } finally {
                //setIsLoading(false);
            }
        };

        checkAuth();
    }, []);
    
    return (
            <BrowserRouter>
                <Toaster position="top-right" />
                {/* --- HEADER (Fixe) --- */}
                <Header />

                {/* --- CONTENU CHANGEANT (Routes) --- */}
                <div id="react-router-container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/draw" element={<Draw />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </div>

                {/* --- FOOTER (Fixe) --- */}
                <Footer />
            </BrowserRouter>
    );
};

const container = document.getElementById('react-root');
if (container) {
    const root = createRoot(container);
    root.render(<ReactBody name="Développeur" />);
}
