import { useEffect, useState } from "react";
import SecurityService from "../../services/SecurityService";
import UserConfig from "../../config/UserConfig";
import { Button, Form, Modal } from "react-bootstrap";
import UserService from "../../services/UserService";
import { UserPassword } from "../../types/indexType";
import ToastFacade from "../../facade/ToastFacade";


type EditUserPasswordModalProps = {
    isModalEditUserPasswordOpen: boolean,
    handleCloseEditUserPasswordModal: () => void,
    loadUser: () => void,
    //user: UserInfo
}

const EditUserPasswordModal = ({
    isModalEditUserPasswordOpen, 
    handleCloseEditUserPasswordModal, 
    loadUser
}: EditUserPasswordModalProps) : React.ReactElement => {
    const [oldPassword, setOldPassword] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [isOldPasswordVisible, setIsPasswordOldVisible] = useState<boolean>(false);
    
    const securityService = SecurityService.getInstance();
    const userService = UserService.getInstance();

    useEffect(() => {
        if (
            oldPassword.length >= UserConfig.PASSWORD_MIN_LENGTH 
            && oldPassword.length <= UserConfig.PASSWORD_MAX_LENGTH 
            && password.length >= UserConfig.PASSWORD_MIN_LENGTH 
            && password.length <= UserConfig.PASSWORD_MAX_LENGTH 
            && password2.length >= UserConfig.PASSWORD_MIN_LENGTH 
            && password2.length <= UserConfig.PASSWORD_MAX_LENGTH 
            && password === password2
            && password !== oldPassword
            && UserConfig.PASSWORD_REGEX.test(password)
            //&& UserConfig.PASSWORD_REGEX.test(oldPassword)
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [oldPassword, password, password2]);

    const togglePassword = () => {
        setIsPasswordVisible((previous) => !previous);
    }

        const toggleOldPassword = () => {
        setIsPasswordOldVisible((previous) => !previous);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //console.log('Modifier le mot de passe');
        const data: UserPassword = {
            oldPassword: oldPassword,
            password: password,
            password2: password2
        }
        const response = await userService.changePassword(data);
        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la mise à jour !');
            return;
        }

        try {
            const data = await response.json();
            if (data.status === 201) {
                handleCloseEditUserPasswordModal();
                loadUser(); // ???
                ToastFacade.success('Mise à jour réussie : ' + data.message + ' !');
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
            
        
    }

    return (
        <Modal
            size="lg"
            className="modal-dark"
            show={isModalEditUserPasswordOpen} 
            onHide={handleCloseEditUserPasswordModal} 
            centered
        >
            <Modal.Header className="modal-dark-header">
                <Modal.Title>Modifier le mot de passe</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body">
                <Form className="react-form" noValidate onSubmit={handleSubmit}>   
                    <Form.Group className="mb-3 d-flex gap-2 w-75 align-items-end" controlId="formOldPassword">
                        <div className="d-flex gap-0 flex-column w-100">
                            <Form.Label>Mot de passe actuel</Form.Label>
                            <Form.Control
                                max={UserConfig.PASSWORD_MAX_LENGTH} 
                                min={UserConfig.PASSWORD_MIN_LENGTH}
                                type={isOldPasswordVisible ? 'text' : 'password'}
                                name="oldPassword"
                                className="react-input form-control"
                                placeholder="Mot de passe actuel"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                title={`Le mot de passe doit comporter entre ${UserConfig.PASSWORD_MIN_LENGTH} et ${UserConfig.PASSWORD_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.PASSWORD_FORMAT}`}
                            />
                        </div>
                        <Button 
                            type="button"
                            onClick={toggleOldPassword} 
                            variant="primary" 
                            className="btn btn-primary"
                            disabled={oldPassword === ''}
                        >
                            {isPasswordVisible ? '🙈' : '👁'}
                        </Button>
                    </Form.Group>
                    <Form.Group className="mb-3 w-75" controlId="formPassword">
                        <div className="d-flex gap-0 flex-column">
                            <Form.Label>Nouveau mot de passe</Form.Label>
                            <Form.Control
                                max={UserConfig.PASSWORD_MAX_LENGTH} 
                                min={UserConfig.PASSWORD_MIN_LENGTH}
                                type={isPasswordVisible ? 'text' : 'password'}
                                name="password"
                                className="react-input form-control"
                                placeholder="Nouveau mot de passe"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password" 
                                title={`Le mot de passe doit comporter entre ${UserConfig.PASSWORD_MIN_LENGTH} et ${UserConfig.PASSWORD_MAX_LENGTH} caractères et doit respecter le format suivant : ${UserConfig.PASSWORD_FORMAT}`}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex gap-2 w-75 align-items-end" controlId="formPassword2">
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
                    <Button variant="primary" type="submit" disabled={!isFormValid}>
                        Modifier le mot de passe
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseEditUserPasswordModal}>Fermer</Button>
            </Modal.Footer>

        </Modal>
    );
}

export default EditUserPasswordModal;