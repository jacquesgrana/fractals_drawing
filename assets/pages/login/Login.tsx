import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import SecurityService from "../../services/SecurityService";
import { Link, useNavigate } from 'react-router-dom';
import ToastFacade from '../../facade/ToastFacade';
import { Nullable } from '../../types/commonTypes';
import UserConfig from '../../config/UserConfig';
import { CaptchaHandle } from '../../types/indexType';
import CustomCaptcha from '../../common/CustomCaptcha';

// TODO ajouter captcha

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

    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    // 1. STATE : Pour savoir si le captcha est bon
    const [isCaptchaValid, setIsCaptchaValid] = useState<boolean>(false);

    const captchaRef = useRef<CaptchaHandle>(null);

    const securityService = SecurityService.getInstance();
    const navigate = useNavigate();  

    useEffect(() => {
        let isValid = true;
        if(email === '' || password === '') {
            isValid = false;
        }
        if(password.length > UserConfig.PASSWORD_MAX_LENGTH) {
            isValid = false;
        }
        if(password.length < UserConfig.PASSWORD_MIN_LENGTH) {
            isValid = false;
        }
        if(email.length > UserConfig.EMAIL_MAX_LENGTH) {
            isValid = false;
        }
        if(email.length < UserConfig.EMAIL_MIN_LENGTH) {
            isValid = false;
        }
        if(!UserConfig.EMAIL_REGEX.test(email)) {
            isValid = false;
        }
        if(!UserConfig.PASSWORD_REGEX.test(password)) {
            isValid = false;
        }
        if(!isCaptchaValid) {
            isValid &&= false;
            //errorMsg += 'Captcha invalide / ';
        }

        setIsFormValid(isValid);
    }, [email, password, isCaptchaValid]);

    const togglePassword = () => {
        setIsPasswordVisible((previous) => !previous);
    }

    // 2. Fonction qui gère la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Empêche le rechargement de la page
        setError(null);     // On efface les erreurs précédentes
        if (!isCaptchaValid) {
            alert("Veuillez résoudre le calcul de sécurité.");
            return;
        }

        const loginData = {
            email: email,
            password: password
        }
        try {
            const response: Nullable<Response> = await securityService.login(loginData);
            //const datas = await response?.json();
            if(response) {
                
                    if (response.ok) {
                    //const datas = await response.json();
                    // Connexion réussie (Code 200)
                    //console.log('Login success !');
                    // ICI: Rediriger l'utilisateur, par exemple :
                    //window.location.href = '/'; 
                    navigate('/');
                    // TODO afficher toast
                    ToastFacade.success('Connexion réussie  de ' + securityService.getUser()?.pseudo + '.');

                } else {
                    // Erreur (Code 401 par exemple)
                    if (response.status === 401) {
                        const datas = await response.json();
                        //console.log('Login failed !');
                        // TODO afficher toast
                        //setError('Erreur : ' + data.error);
                    // TODO afficher toast
                        navigate('/error401');
                        ToastFacade.error('Erreur : ' + datas.error + '.');
                    }
                    else {
                        // TODO afficher toast
                        ToastFacade.error('Une erreur s\'est produite lors de la connexion.');
                    }
                }
            }

        } catch (error) {
            console.error('Erreur API', error);
        }
        
        if (captchaRef.current) {
                captchaRef.current.reset();
        }
    };

    return (
        <div className="react-card login-page">
            <h2>Page de login</h2>
            <p>Saisissez vos identifiants pour vous connecter</p>

            <Form onSubmit={handleSubmit} className="react-form">
                
                {/* Champ Email contrôlé */}
                <Form.Group className="w-100">
                    <input 
                        max={UserConfig.EMAIL_MAX_LENGTH} 
                        min={UserConfig.EMAIL_MIN_LENGTH}
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        className="react-input form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                        title={`L'email doit comporter entre ${UserConfig.EMAIL_MIN_LENGTH} et ${UserConfig.EMAIL_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.EMAIL_FORMAT}`}
                    />
                </Form.Group>

                {/* Champ Password contrôlé */}
                <Form.Group className="d-flex gap-2 w-100">
                    <input 
                        max={UserConfig.PASSWORD_MAX_LENGTH} 
                        min={UserConfig.PASSWORD_MIN_LENGTH}
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
                        disabled={password === ''}
                    >
                        {isPasswordVisible ? '🙈' : '👁'}
                    </Button>
                </Form.Group>

                <Button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={!isFormValid}
                >
                    Se connecter
                </Button>
            </Form>

            <CustomCaptcha 
                ref={captchaRef} // On attache la ref
                onVerify={(isValid: boolean) => setIsCaptchaValid(isValid)} // On écoute le résultat
            />
            <Link className="react-link-dark" to="/forgot-password">Mot de passe oublié</Link>
        </div>
    );
};

export default Login;
