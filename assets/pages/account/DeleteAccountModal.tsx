import { Button, Form, Modal } from "react-bootstrap";
import { UserInfo } from "../../types/indexType";
import React, { use } from "react";
import UserConfig from "../../config/UserConfig";
import UserService from "../../services/UserService";
import ToastFacade from "../../facade/ToastFacade";
import SecurityService from "../../services/SecurityService";
import { useNavigate } from "react-router-dom";

type DeleteAccountModalProps = {
    isModalDeleteAccountOpen: boolean;
    handleCloseDeleteAccountModal: () => void;
    //loadUser: () => void;
    user: UserInfo;
}

const DeleteAccountModal = ({ 
    isModalDeleteAccountOpen, 
    handleCloseDeleteAccountModal,
    //loadUser,
    user
}: DeleteAccountModalProps) => {

const [password, setPassword] = React.useState<string>('');
const [isFormValid, setIsFormValid] = React.useState<boolean>(false);
const [isPasswordVisible, setIsPasswordVisible] = React.useState<boolean>(false);

const userService = UserService.getInstance();
const securityService = SecurityService.getInstance();
const navigate = useNavigate();

React.useEffect(() => {
        if (
            password.length >= UserConfig.PASSWORD_MIN_LENGTH 
            && password.length <= UserConfig.PASSWORD_MAX_LENGTH 
            && UserConfig.PASSWORD_REGEX.test(password)
            //&& UserConfig.PASSWORD_REGEX.test(oldPassword)
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [password]);

const toggleIsPasswordVisible = () => {
    setIsPasswordVisible(!isPasswordVisible);
}

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //console.log('Submit');

    const confirm = window.confirm('Voulez-vous vraiment supprimer définitivement ce compte ?');
    if(!confirm) {
        //handleCloseDeleteAccountModal();
        return;
    }

    // récupérer les données du formulaire
    const userData: any = {
        password: password
    };

    if(!isFormValid) {
        return;
    }
    const response = await userService.deleteAccount(userData);

    if(!response) {
        ToastFacade.error('Erreur : Erreur lors de la suppression !');
        return;
    }

    try {
        const data = await response.json();
        if (data.status === 201) {
            ToastFacade.success('Suppression réussie : ' + data.message + ' !');
            //await securityService.logout();
            //securityService.notifySubscribers();
            await securityService.me();
            navigate('/');
        }
        else if (data.status === 400) {
            ToastFacade.error('Erreur 400 : ' + data.message + ' !');
        }
        else if (data.status === 403) {
            ToastFacade.error('Erreur 403 : ' + data.message + ' !');
        }
        else if (data.status === 404) {
            ToastFacade.error('Erreur 404 : ' + data.message + ' !');
        }
        else {
            ToastFacade.error('Erreur : ' + data.message + ' !');
        }
    }
    catch (error) {
        ToastFacade.error('Erreur : ' + error + ' !');
    }
    finally {
        handleCloseDeleteAccountModal();
        //loadUser();
    }
}  
    return (
        <Modal
            size="lg"
            className="modal-dark"
            show={isModalDeleteAccountOpen} 
            onHide={handleCloseDeleteAccountModal} 
            centered
        >
            <Modal.Header className="modal-dark-header">
                <Modal.Title>Supprimer le compte</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body"> 
                <Form className="react-form" onSubmit={handleSubmit}>   
                    <Form.Group className="mb-3 d-flex gap-2 w-75 align-items-end" controlId="formOldPassword">
                        <div className="d-flex gap-0 flex-column w-100">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                max={UserConfig.PASSWORD_MAX_LENGTH} 
                                min={UserConfig.PASSWORD_MIN_LENGTH}
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="oldPassword"
                                className="react-input form-control"
                                placeholder="Mot de passe"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                title={`Le mot de passe doit comporter entre ${UserConfig.PASSWORD_MIN_LENGTH} et ${UserConfig.PASSWORD_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.PASSWORD_FORMAT}`}
                            />
                        </div>
                        <Button 
                            type="button"
                            onClick={toggleIsPasswordVisible} 
                            variant="primary" 
                            className="btn btn-primary mb-1"
                            disabled={password === ''}
                        >
                            {isPasswordVisible ? '🙈' : '👁'}
                        </Button>
                    </Form.Group>
                    <Button className="btn btn-danger" type="submit" disabled={!isFormValid}>
                        Supprimer le compte
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseDeleteAccountModal} type="button">Fermer</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteAccountModal;