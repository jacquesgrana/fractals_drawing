import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles/app.scss'; // Ton SCSS

import Home from './pages/home/Home';
import Draw from './pages/draw/Draw';
import Login from './pages/login/Login';
import VerifyEmail from './pages/verify/VerifyEmail';
import Error401 from './pages/errors/Error401';
import Error404 from './pages/errors/Error404';
import Header from './layout/Header';
import Footer from './layout/Footer';
import SecurityService from './services/SecurityService';
import { Toaster } from 'react-hot-toast';
import Register from './pages/register/Register';

const ReactBody = () => {

    const securityService = SecurityService.getInstance();

    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await securityService.me();

                /*
                if(response) {
                    if (response.status === 200) {
                        //console.log(response)
                        //const userData = await response.json();
                        //console.log('Utilisateur restauré : ', securityService.getUser()?.email);
                    } else {
                        //console.log('Pas de session active');
                    }
                }
                */
                    
                
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
                <Header />
                <div id="react-router-container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/draw" element={<Draw />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify" element={<VerifyEmail />} />
                        <Route path="/error401" element={<Error401 />} />
                        <Route path="*" element={<Error404 />} />
                    </Routes>
                </div>
                <Footer />
            </BrowserRouter>
    );
};

const container = document.getElementById('react-root');
if (container) {
    const root = createRoot(container);
    root.render(<ReactBody />);
}
