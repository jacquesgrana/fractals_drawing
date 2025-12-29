import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles/app.scss'; // Ton SCSS

import Home from './pages/Home';
import Draw from './pages/Draw';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';

const ReactBody = ({ name }: { name: string }) => {
    return (
            <BrowserRouter>
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
