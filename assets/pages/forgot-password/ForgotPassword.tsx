import React, { useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import UserConfig from '../../config/UserConfig';
import UserService from '../../services/UserService';
import { UserEmail, UserEmailWithCode, UserPasswordWithCode } from '../../types/indexType';
import ToastFacade from '../../facade/ToastFacade';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () : React.ReactElement => {

    const [email, setEmail] = React.useState<string>('');
    const [verifCode, setVerifCode] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [password2, setPassword2] = React.useState<string>('');

    const [isFormValid, setIsFormValid] = React.useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = React.useState<boolean>(false);
    const [isEmailPresent, setIsEmailPresent] = React.useState<boolean>(false);
    const [isEmailWithCodeSent, setIsEmailWithCodeSent] = React.useState<boolean>(false);
    const [isVerifCodeValid, setIsVerifCodeValid] = React.useState<boolean>(false);
    const [isVerifCodeVerified, setIsVerifCodeVerified] = React.useState<boolean>(false);
    const [isPasswordsValids, setIsPasswordsValids] = React.useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = React.useState<boolean>(false);

    const [isPasswordVisible, setIsPasswordVisible] = React.useState<boolean>(false);

    
    const navigate = useNavigate();
    const userService = UserService.getInstance();


    useEffect(() => {
        resetForm();
        let isEmailVal = true;
        let isFormVal = true;
        //setIsEmailValid(email);
        if(email.length > UserConfig.EMAIL_MAX_LENGTH) {
            isEmailVal = false;
        }
        if(email.length < UserConfig.EMAIL_MIN_LENGTH) {
            isEmailVal = false;
        }
        if(!UserConfig.EMAIL_REGEX.test(email)) {
            isEmailVal = false;
        }
        setIsEmailValid(isEmailVal);
        isFormVal = isEmailVal && isEmailPresent && isEmailWithCodeSent && isVerifCodeValid && isVerifCodeVerified && isPasswordsValids;
        setIsFormValid(isFormVal);
    }, [email]);

    useEffect(() => {
        setIsVerifCodeValid(false);
        let isVerifCodeVal = true;
        if(verifCode.length !== UserConfig.VERIF_CODE_LENGTH || !UserConfig.VERIF_CODE_REGEX.test(verifCode)) {
            isVerifCodeVal = false;
        }
        setIsVerifCodeValid(isVerifCodeVal);
        const isFormVal = isEmailValid && isEmailPresent && isEmailWithCodeSent && isVerifCodeVal && isVerifCodeVerified && isPasswordsValids;
        setIsFormValid(isFormVal);
    }, [verifCode, isVerifCodeVerified]);

    useEffect(() => {
        setIsPasswordsValids(false);
        let isPasswordsVal = true;
        if(password.length < UserConfig.PASSWORD_MIN_LENGTH || password.length > UserConfig.PASSWORD_MAX_LENGTH || !UserConfig.PASSWORD_REGEX.test(password)) {
            isPasswordsVal = false;
        }
        if(password2.length < UserConfig.PASSWORD_MIN_LENGTH || password2.length > UserConfig.PASSWORD_MAX_LENGTH || !UserConfig.PASSWORD_REGEX.test(password2)) {
            isPasswordsVal = false;
        }
        if(password !== password2) {
            isPasswordsVal = false;
        }
        setIsPasswordsValids(isPasswordsVal);
        const isFormVal = isEmailValid && isEmailPresent && isEmailWithCodeSent && isVerifCodeValid && isVerifCodeVerified && isPasswordsVal;
        setIsFormValid(isFormVal);
        
    }, [password, password2]);

    const togglePassword = () => {
        setIsPasswordVisible((previous) => !previous);
    }

    const resetForm = () => {
        //setEmail('');
        setIsFormValid(false);
        setIsEmailValid(false);
        setIsEmailPresent(false);
        setIsEmailWithCodeSent(false);
        setIsVerifCodeValid(false);
        setIsVerifCodeVerified(false);
        setIsEmailVerified(false);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data: UserPasswordWithCode = {
            email: email,
            code: verifCode,
            password: password,
            password2: password2
        }

        // faire requete avec le UserService
        const response = await userService.updateForgotPassword(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la mise à jour !');
            return;
        }

        try{
            const data = await response.json(); 
            if (data.status === 201) {
                ToastFacade.success('Mise à jour reussie : ' + data.message + ' !');
                navigate('/login');
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
            }
            else if (data.status === 404) {
                ToastFacade.error('Erreur 404 : ' + data.message + ' !');
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
            }
        } catch (err) {
            console.error(err);
            ToastFacade.error('Erreur : Erreur lors de la mise à jour !');
        }
    };

    const handleVerifyEmail = async (e: React.MouseEvent) => {
        e.preventDefault();
        const data: UserEmail = {
            email: email
        }
        // faire requete avec le UserService
        const response = await userService.verifyUsedEmail(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la mise à jour !');
            return;
        }

        try{
            const data = await response.json(); 
            if (data.status === 201) {
                ToastFacade.success('Vérification reussie : ' + data.message + ' !');
                setIsEmailPresent(true);
            }
            else if (data.status === 404) {
                ToastFacade.error('Erreur 404 : ' + data.message + ' !');
                setIsEmailPresent(false);
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
                setIsEmailPresent(false);
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
                setIsEmailPresent(false);
            }
        }
        catch (err) {
            console.error(err);
            ToastFacade.error('Erreur : Erreur lors de la vérification !');
            setIsEmailPresent(false);
            //return;
        }

        // vérifier si l'email est présent dans la base de données
            // si oui, envoyer un email de verification avec un code
            // si non, renvoyer un message d'erreur
    }

    const handleSendCodetoEmail = async (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("envoi de l'email de vérification de l'adresse avec un code" +    email);
        const data: UserEmail = {
            email: email
        }
        // faire requete avec le UserService
        const response = await userService.sendEmailWithCodeToEmailForPassword(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de l\'envoi du code !');
            setIsEmailWithCodeSent(false);
            return;
        }

        try {
            const data = await response.json(); 
            if (data.status === 200) {
                ToastFacade.success('Envoi reussi : ' + data.message + ' !');
                //set le nouveau state isEmailWithCodeSent = true
                setIsEmailWithCodeSent(true);
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
                setIsEmailWithCodeSent(false);
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
                setIsEmailWithCodeSent(false);
            }
        }
        catch (err) {
            console.error(err);
            ToastFacade.error('Erreur : Erreur lors de l\'envoi du code !');
            setIsEmailWithCodeSent(false);
            //return;
        }
    }

    const handleVerifyCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        const data: UserEmailWithCode = {
            email: email,
            code: verifCode
        }

        const response = await userService.verifyEmailCodeForPassword(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la verification !');
            setIsVerifCodeVerified(false);
            return;
        }

        try{
            const data = await response.json(); 
            if (data.status === 200) {
                ToastFacade.success('Vérification reussie : ' + data.message + ' !');
                setIsVerifCodeVerified(true);
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : Vérification échouée : ' + data.message + ' !');
                setIsVerifCodeVerified(false);
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
                setIsVerifCodeVerified(false);
            }
        }
        catch (err) {
            console.error(err);
            ToastFacade.error('Erreur : Erreur lors de la vérification !');
            setIsVerifCodeVerified(false);
            //return;
        }
    }


    return (
    <div className="react-card forgot-password-page">
        <h2>Mot de passe oublié</h2>
        <p>Saisir votre adresse email et vérifiez-la</p>

        <Form onSubmit={handleSubmit} className="react-form">
            <Form.Group className="d-flex flex-column gap-2 w-100">
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
                <Button 
                    type="button"
                    onClick={handleVerifyEmail} 
                    variant="primary" 
                    className="btn btn-primary w-100"
                    disabled={!isEmailValid}
                >
                    Vérifier l'email
                </Button>

                {isEmailPresent && 
                <>
                    <Button 
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleSendCodetoEmail} 
                    variant="primary" 
                    disabled={!isEmailValid || !isEmailPresent}
                    >
                        Envoyer code
                    </Button>
                </>
                }

                {isEmailWithCodeSent && 
                <div className="d-flex flex-column align-items-center gap-1">
                    <p className="text-success-dark mt-0 mb-0">Code envoyé !</p>
                    <Form.Group className="w-100 mb-3" controlId="formBasicCode">
                        <Form.Label>Code</Form.Label>
                        <Form.Control 
                            max={UserConfig.VERIF_CODE_LENGTH}
                            min={UserConfig.VERIF_CODE_LENGTH}
                            type="text" 
                            placeholder="Code" 
                            className="react-input mt-0 w-100"
                            required
                            value={verifCode}
                            onChange={(e) => setVerifCode(e.target.value)}
                            autoComplete="off"
                            title={`Le code doit comporter ${UserConfig.VERIF_CODE_LENGTH} caractères et être composé de : "${UserConfig.VERIF_CODE_FORMAT}".`}
                        />
                    </Form.Group>
                    <Button 
                    className="btn btn-primary w-100"
                    variant="primary" 
                    type="button" 
                    onClick={handleVerifyCode}
                    disabled={verifCode === '' || !isVerifCodeValid}
                    >
                        Vérifier le code
                    </Button>
                </div>
                }

                {isVerifCodeVerified && 
                <>
                    <Form.Group className="w-100" controlId="formBasicPassword">
                        <Form.Label>Mot de passe</Form.Label>
                        <Form.Control 
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="Mot de passe" 
                            className="react-input mt-0 w-100"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="off"
                            title={`Le mot de passe doit comporter entre ${UserConfig.PASSWORD_MIN_LENGTH} et ${UserConfig.PASSWORD_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.PASSWORD_FORMAT}`}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex gap-2 w-100 align-items-end" controlId="formPassword2">
                        <div className="d-flex gap-0 flex-column w-100">
                            <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                            <Form.Control
                                max={UserConfig.PASSWORD_MAX_LENGTH} 
                                min={UserConfig.PASSWORD_MIN_LENGTH}
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="password2"
                                className="react-input form-control"
                                placeholder="Confirmer le nouveau mot de passe"
                                required
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                autoComplete="off"
                                title={`La confirmation doit comporter entre ${UserConfig.PASSWORD_MIN_LENGTH} et ${UserConfig.PASSWORD_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.PASSWORD_FORMAT}`}
                            />
                        </div>
                        <Button 
                            type="button"
                            onClick={togglePassword} 
                            variant="primary" 
                            className="btn btn-primary"
                            disabled={password === '' && password2 === ''}
                        >
                            {isPasswordVisible ? '🙈' : '👁'}
                        </Button>
                    </Form.Group>
                </>
                }
                
            </Form.Group>
            <Button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={!isFormValid}
            >
                Modifier
            </Button>
        </Form>
        </div>

    );
};
export default ForgotPassword;
