import { Button, Form, Modal } from "react-bootstrap";
import UserConfig from "../../config/UserConfig";
import ToastFacade from "../../facade/ToastFacade";
import UserService from "../../services/UserService";
import { UserEmail, UserInfo } from "../../types/indexType"
import React, { useEffect, useState } from 'react';

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

    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    const userService = UserService.getInstance();

    useEffect(() => {

        // TODO faire méthode
        if (
            email.length >= UserConfig.EMAIL_MIN_LENGTH 
            && email.length <= UserConfig.EMAIL_MAX_LENGTH 
            && email !== user.email
            && UserConfig.EMAIL_REGEX.test(email)
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [email]); 
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            //console.log('Submit');

            // récupérer les données du formulaire
            const userData: UserEmail = {
                email: email
            }

            if(!isFormValid) {
                return;
            }
            /*
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
                    ToastFacade.success('Mise à jour reussie : ' + data.message + ' !');
                }
                else if (data.status === 400) {
                    ToastFacade.error('Erreur : ' + data.message + ' !');
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
            */
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
                <Modal.Title>Modifier votre adresse email</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body">                
                <Form className="react-form" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Adresse email</Form.Label>
                        <Form.Control 
                            min={UserConfig.EMAIL_MIN_LENGTH}
                            max={UserConfig.EMAIL_MAX_LENGTH}
                            type="email" 
                            placeholder="Email" 
                            className="react-input mt-0"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            title={`L'email doit comporter entre ${UserConfig.EMAIL_MIN_LENGTH} et ${UserConfig.EMAIL_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.EMAIL_FORMAT}`}
                        />
                    </Form.Group>
                    <Button disabled={!isFormValid} variant="primary" type="submit">Modifier</Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseEditUserEmailModal} type="button">Fermer</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditUserEmailModal;