import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import SecurityService from "../services/SecurityService";
import { useNavigate } from 'react-router-dom';
import ToastFacade from '../facade/ToastFacade';

/**
 * Composant React pour la page de login.
 * 
 * @returns Un élément React représentant la page de login.
 */
const Login = (): React.ReactElement => {
    // 1. États pour stocker les valeurs des champs et les erreurs
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    // État pour la visibilité du mot de passe
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const securityService = SecurityService.getInstance();
    const navigate = useNavigate();  

    const togglePassword = () => {
        setIsPasswordVisible((previous) => !previous);
    }

    // 2. Fonction qui gère la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Empêche le rechargement de la page
        setError(null);     // On efface les erreurs précédentes


            const loginData = {
                email: email,
                password: password
            }
            const response: Response | null = await securityService.login(loginData);

            if(response) {
                if (response.ok) {
                    // Connexion réussie (Code 200)
                    //console.log('Login success !');
                    // ICI: Rediriger l'utilisateur, par exemple :
                    //window.location.href = '/'; 
                    navigate('/');
                    // TODO afficher toast
                    ToastFacade.success('Connexion réussie !');

                } else {
                    // Erreur (Code 401 par exemple)
                    setError('Email ou mot de passe incorrect.');
                    // TODO afficher toast
                    ToastFacade.error('Email ou mot de passe incorrect.');

                }
            }
            
    };

    return (
        <div className="react-card login-page">
            <h2>Page de login</h2>
            <p>Saisissez vos identifiants pour vous connecter</p>
            
            {/* Affichage de l'alerte en cas d'erreur */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Note le onSubmit ici au lieu de action="..." */}
            <Form onSubmit={handleSubmit} className="react-form">
                
                {/* Champ Email contrôlé */}
                <Form.Group className="mb-2 w-100">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        className="react-input form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                {/* Champ Password contrôlé */}
                <Form.Group className="mb-2 d-flex gap-2 w-100">
                    <input 
                        type={isPasswordVisible ? 'text' : 'password'} 
                        name="password" 
                        placeholder="Mot de passe" 
                        className="react-input form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button 
                        type="button"
                        onClick={togglePassword} 
                        variant="primary" 
                        className=""
                    >
                        {isPasswordVisible ? '🙈' : '👁'}
                    </Button>
                </Form.Group>

                <Button type="submit" className="btn btn-primary w-100">
                    Se connecter
                </Button>
            </Form>
        </div>
    );
};

export default Login;
