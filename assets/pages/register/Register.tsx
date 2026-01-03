import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import SecurityService from '../../services/SecurityService';
import { useNavigate } from 'react-router-dom';
import { CaptchaHandle, Nullable, UserRegister } from '../../types/indexType';
import ToastFacade from '../../facade/ToastFacade';
import UserConfig from '../../config/UserConfig';
import CustomCaptcha from '../../common/CustomCaptcha';

const Register = () : React.ReactElement => {
    //const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');

    const [pseudo, setPseudo] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');

    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    // État pour l'affichage de l'alerte rouge en haut
    const [displayError, setDisplayError] = useState<string | null>(null);
    
    // État "silencieux" qui contient le message composé (ex: "Email vide / Pseudo vide")
    const [composedError, setComposedError] = useState<string>('');

    // 1. STATE : Pour savoir si le captcha est bon
    const [isCaptchaValid, setIsCaptchaValid] = useState<boolean>(false);
    
    const captchaRef = useRef<CaptchaHandle>(null);

    const securityService = SecurityService.getInstance();
    const navigate = useNavigate();  


    useEffect(() => {
        let errorMsg = '';
        let isValid = true;

        if (email === '') {
            isValid &&= false;
            errorMsg += 'Email vide / ';
        } else if (!UserConfig.EMAIL_REGEX.test(email)) {
            // Si l'email n'est pas vide mais ne respecte pas le format
            isValid &&= false;
            errorMsg += 'Format Email invalide / ';
        }
        if(password === '') {
            isValid &&= false;
            errorMsg += 'Mot de passe vide / ';
        }
        if(password.length > 0 && password.length < UserConfig.PASSWORD_MIN_LENGTH) {
            isValid &&= false;
            errorMsg += 'Mot de passe trop court (< ' + UserConfig.PASSWORD_MIN_LENGTH + ') / ';
        }
        if(password2 === '') {
            isValid &&= false;
            errorMsg += 'Confirmation vide / ';
        }
        if(password2.length > 0 && password2.length < UserConfig.PASSWORD_MIN_LENGTH) {
            isValid &&= false;
            errorMsg += 'Confirmation trop courte (< ' + UserConfig.PASSWORD_MIN_LENGTH + ') / ';
        }
        if(pseudo === '') {
            isValid &&= false;
            errorMsg += 'Pseudo vide / ';
        } else if (!UserConfig.PSEUDO_REGEX.test(pseudo)) {
            // Si l'email n'est pas vide mais ne respecte pas le format
            isValid &&= false;
            errorMsg += 'Format Pseudo invalide / ';
        }
        if(firstName === '') {
            isValid &&= false;
            errorMsg += 'Prénom vide / ';
        }
        if(lastName === '') {
            isValid &&= false;
            errorMsg += 'Nom de famille vide / ';
        }
        if(password !== '' && password2 !== '' && password.localeCompare(password2) !== 0) {
            isValid &&= false;
            errorMsg += 'Les mots de passe ne correspondent pas / ';
        }
        if(!isCaptchaValid) {
            isValid &&= false;
            errorMsg += 'Captcha invalide / ';
        }


        if(errorMsg.endsWith(' / ')) {
            errorMsg = errorMsg.substring(0, errorMsg.length - 3);
        }

        
        setComposedError(errorMsg);
        setIsFormValid(isValid);

        const isFormTouched = email !== '' || password !== '' || password2 !== '' || pseudo !== '' || firstName !== '' || lastName !== '';

        if (isValid) {
            // Si le formulaire est valide, on retire l'erreur
            setDisplayError(null);
        } 
        else if (isFormTouched) {
            // Si invalide ET que l'utilisateur a commencé à écrire, on affiche l'erreur
            setDisplayError(errorMsg);
        } 
        else {
            // Si tout est vide (premier chargement de page), on laisse l'alerte vide
            setDisplayError(null);
        }

    }, [email, password, password2, pseudo, firstName, lastName, isCaptchaValid]); // Dépendances

    const togglePassword = () => {
        setIsPasswordVisible((previous) => !previous);
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Empêche le rechargement de la page

        if (!isCaptchaValid) {
            alert("Veuillez résoudre le calcul de sécurité.");
            return;
        }

        const userData: UserRegister = {
            email: email,
            password: password,
            pseudo: pseudo,
            firstName: firstName,
            lastName: lastName
        }
        if (!isFormValid) {
            setDisplayError(composedError);
            return;
        }

        // TODO ajouter vérification du captcha

        const response: Nullable<Response> = await securityService.register(userData);
        if(response) {
            const data = await response.json();
            if (data.status === 201) {
                //console.log('Inscription reussie !');
                ToastFacade.success('Inscription reussie : ' + data.message + ' !');
                navigate('/');
            } else {
                //console.log('Inscription echouee !');
                ToastFacade.error('Inscription échouée : ' + data.message + ' !');
            }
        }

        if (captchaRef.current) {
                captchaRef.current.reset();
        }
        
    }

        // TODO ajouter captcha

    return (
        <div className="react-card register-page">
            <h2>Page d'inscription</h2>
            <p>Saisissez vos données personnelles</p>

            {displayError && <Alert variant="danger">{displayError}</Alert>}

            <Form onSubmit={handleSubmit} className="react-form">
                <Form.Group className="w-100">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        className="react-input form-control"
                        value={email}
                        onChange={(e) => {
                            setEmail(() => e.target.value);
                            }
                        }
                        required
                        autoComplete="off"
                    />
                </Form.Group>

                <Form.Group className="w-100 d-flex flex-column gap-2">
                    <input 
                        type={isPasswordVisible ? 'text' : 'password'} 
                        name="password" 
                        placeholder="Mot de passe" 
                        className="react-input form-control"
                        value={password}
                        onChange={(e) => {
                            setPassword(() => e.target.value);
                            }
                        }
                        required
                        autoComplete="new-password" 
                    />
                    <div className="d-flex gap-2 w-100">
                        <input 
                            type={isPasswordVisible ? 'text' : 'password'} 
                            name="password2" 
                            placeholder="Confirmation" 
                            className="react-input form-control"
                            value={password2}
                            onChange={(e) => {
                                setPassword2(() => e.target.value);
                                }
                            }
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
                    </div>
                </Form.Group>

                <Form.Group className="w-100">
                    <input 
                        type="text" 
                        name="pseudo" 
                        placeholder="Pseudo" 
                        className="react-input form-control"
                        value={pseudo}
                        onChange={(e) => {
                            setPseudo(() => e.target.value);
                            }
                        }
                        required
                    />
                </Form.Group>

                <Form.Group className="w-100">
                    <input 
                        type="text" 
                        name="firstName" 
                        placeholder="Prénom" 
                        className="react-input form-control"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(() => e.target.value);
                            }
                    }
                        required
                    />
                </Form.Group>

                <Form.Group className="w-100">
                    <input 
                        type="text" 
                        name="lastName" 
                        placeholder="Nom" 
                        className="react-input form-control"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(() => e.target.value);
                            }
                        }
                        required
                    />
                </Form.Group>

                <Button type="submit" disabled={!isFormValid || !isCaptchaValid} className="btn btn-primary w-100">S'inscrire</Button>
            </Form>
            <CustomCaptcha 
                        ref={captchaRef} // On attache la ref
                        onVerify={(isValid) => setIsCaptchaValid(isValid)} // On écoute le résultat
            />
        </div>
    );
};
export default Register;
