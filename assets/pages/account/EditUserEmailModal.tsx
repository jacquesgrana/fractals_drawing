import { Button, Form, Modal } from "react-bootstrap";
import UserConfig from "../../config/UserConfig";
import ToastFacade from "../../facade/ToastFacade";
import UserService from "../../services/UserService";
import { UserEmail, UserEmailWithCode, UserInfo } from "../../types/indexType"
import React, { useEffect, useState } from 'react';
//import DateUtil from '../../utils/DateUtil';

type EditUserEmailModalProps = {
    isModalEditUserEmailOpen: boolean,
    handleCloseEditUserEmailModal: () => void,
    loadUser: () => void,
    user: UserInfo
}

const EditUserEmailModal = ({ 
        isModalEditUserEmailOpen, 
        handleCloseEditUserEmailModal, 
        user,
        loadUser
    } : EditUserEmailModalProps
) : React.ReactElement => {
    const [email, setEmail] = useState<string>(user.email);
    const [verifCode, setVerifCode] = useState<string>('');

    const [isFormValid, setIsFormValid] = useState<boolean>(true);
    const [isEmailNotUsed, setIsEmailNotUsed] = useState<boolean>(false);
    const [isEmailWithCodeSent, setIsEmailWithCodeSent] = useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    //const [isLoading, setIsLoading] = useState<boolean>(false);

    const userService = UserService.getInstance();

    useEffect(() => {

        // TODO faire méthode
        if (
            email.length >= UserConfig.EMAIL_MIN_LENGTH 
            && email.length <= UserConfig.EMAIL_MAX_LENGTH 
            && UserConfig.EMAIL_REGEX.test(email)
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [email]); 

    const handleVerifyNonUsedEmail = async (e: React.MouseEvent) => {
        e.preventDefault();
        const data: UserEmail = {
            email: email
        }      
        const response = await userService.verifyNonUsedEmail(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la verification !');
            return;
        }

        try{
            const data = await response.json(); 
            if (data.status === 201) {
                ToastFacade.success('Vérification reussie : ' + data.message + ' !');
                setIsEmailNotUsed(true);
            }
            else if (data.status === 409) {
                ToastFacade.error('Erreur 409 : ' + data.message + ' !');
                setIsEmailNotUsed(false);
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : ' + data.message + ' !');
                setIsEmailNotUsed(false);
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
                setIsEmailNotUsed(false);
            }
        }
        catch (error) {
            console.error(error);
            ToastFacade.error('Vérification échouée : ' + error + ' !');
            setIsEmailNotUsed(false);
            return;
        }
            
    }

    const handleSendCodeToEmail = async (e: React.MouseEvent) => {
        e.preventDefault();
        const data: UserEmail = {
            email: email
        }  
        //console.log(data);    
        const response = await userService.sendEmailWithCodeToEmail(data);
        
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de l\'envoi du code !');
            setIsEmailWithCodeSent(false);
            return;
        }

        try{
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
        catch (error) {
            console.error(error);
            ToastFacade.error('Envoi échoué : ' + error + ' !');
            setIsEmailWithCodeSent(false);
        }
    }

    const handleVerifyCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        const data: UserEmailWithCode = {
            email: email,
            code: verifCode
        } 
        console.log(data);
           
        const response = await userService.verifyEmailCode(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la verification !');
            setIsEmailVerified(false);
            return;
        }

        try{
            const data = await response.json(); 
            if (data.status === 200) {
                ToastFacade.success('Vérification reussie : ' + data.message + ' !');
                setIsEmailVerified(true);
            }
            else if (data.status === 400) {
                ToastFacade.error('Erreur 400 : Vérification échouée : ' + data.message + ' !');
                setIsEmailVerified(false);
            }
            else {
                ToastFacade.error('Erreur : ' + data.message + ' !');
                setIsEmailVerified(false);
            }
        }
        catch (error) {
            console.error(error);
            ToastFacade.error('Vérification échouée : ' + error + ' !');
            setIsEmailVerified(false);
        }
        
    }
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            //console.log('Submit');

            // récupérer les données du formulaire
            const userData: UserEmail = {
                email: email
            }

            if(!isFormValid || !isEmailNotUsed || !isEmailWithCodeSent || !isEmailVerified) {
                return;
            }
            
            // faire requete : dans userService
            const response = await userService.updateUserEmail(userData);
            if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la mise à jour !');
            return;
            }

            try{
                const data = await response.json(); 
                if (data.status === 201) {
                    handleCloseEditUserEmailModal();
                    loadUser();
                    ToastFacade.success('Mise à jour réussie : ' + data.message + ' !');
                }
                else if (data.status === 400) {
                    ToastFacade.error('Erreur 400 : ' + data.message + ' !');
                }
                else {
                    ToastFacade.error('Erreur : ' + data.message + ' !');
                }
            }
            catch (error) {
                console.error(error);
                ToastFacade.error('Mise à jour échouée : ' + error + ' !');
                return;
            }
            
    }

    return(
        <Modal
            size="lg"
            className="modal-dark"
            show={isModalEditUserEmailOpen} 
            onHide={handleCloseEditUserEmailModal} 
            centered
        >
            <Modal.Header className="modal-dark-header">
                <Modal.Title>Modifier l'adresse email</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body">                
                <Form className="react-form" onSubmit={handleSubmit}>
                    <Form.Group className="w-75 mb-3" controlId="formBasicEmail">
                        <Form.Label>Adresse email</Form.Label>
                        <Form.Control 
                            min={UserConfig.EMAIL_MIN_LENGTH}
                            max={UserConfig.EMAIL_MAX_LENGTH}
                            type="email" 
                            placeholder="Email" 
                            className="react-input mt-0 w-100"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            title={`L'email doit comporter entre ${UserConfig.EMAIL_MIN_LENGTH} et ${UserConfig.EMAIL_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.EMAIL_FORMAT}`}
                        />
                    </Form.Group>
                    {!isFormValid && (
                        <p className="text-danger-dark mt-0 mb-0">Veuillez entrer une adresse email valide !</p>)}
                    {!isEmailNotUsed && isFormValid && email !== user.email && (
                        <div className="d-flex flex-column align-items-center gap-1">
                            <p className="text-danger-dark mt-0 mb-0">Vérifier que l'email n'est pas utilisé !</p>
                            <Button variant="primary" type="button" onClick={handleVerifyNonUsedEmail}>Vérifier</Button>
                        </div>
                    )}
                    {isEmailNotUsed && isFormValid && email !== user.email && (
                        <>
                            <p className="text-success-dark mt-0 mb-0">Email disponible !</p>
                            <Button variant="primary" type="button" onClick={handleSendCodeToEmail}>Envoyer code</Button>
                        </>
                    )}

                    {isEmailWithCodeSent && isFormValid && email !== user.email && (
                        <div className="d-flex flex-column align-items-center gap-1">
                            <p className="text-success-dark mt-0 mb-0">Code envoyé !</p>
                            <Form.Group className="w-75 mb-3" controlId="formBasicCode">
                                <Form.Label>Code</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Code" 
                                    className="react-input mt-0 w-100"
                                    required
                                    value={verifCode}
                                    onChange={(e) => setVerifCode(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="primary" type="button" onClick={handleVerifyCode}>Valider le code</Button>
                        </div>
                    )}
                    <Button disabled={!isFormValid || !isEmailVerified || !isEmailNotUsed} variant="primary" type="submit">Modifier</Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseEditUserEmailModal} type="button">Fermer</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditUserEmailModal;