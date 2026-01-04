import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { UserInfo, UserParams } from '../../types/indexType';
import UserService from '../../services/UserService';
import ToastFacade from '../../facade/ToastFacade';

type ModalEditUserProps = {
    isModalEditUserOpen: boolean,
    handleCloseEditUserModal: () => void,
    loadUser: () => void,
    user: UserInfo
}

const ModalEditUser = ({ 
        isModalEditUserOpen, 
        handleCloseEditUserModal, 
        user,
        loadUser
    } : ModalEditUserProps
) : React.ReactElement => {
    // TODO mettre dans config !!
    const MIN_LENGTH = 3;
    const MAX_LENGTH_PSEUDO = 15;
    const MAX_LENGTH = 30;
    //const [isLoading, setIsLoading] = useState(false);
    const [pseudo, setPseudo] = useState<string>(user.pseudo);
    const [firstName, setFirstName] = useState<string>(user.firstName);
    const [lastName, setLastName] = useState<string>(user.lastName);

    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    const userService = UserService.getInstance();

    useEffect(() => {

        // TODO faire méthode
        if (
            pseudo.length > MIN_LENGTH 
            && firstName.length > MIN_LENGTH 
            && lastName.length > MIN_LENGTH
            && pseudo.length <= MAX_LENGTH_PSEUDO
            && firstName.length <= MAX_LENGTH
            && lastName.length <= MAX_LENGTH
            && (pseudo !== user.pseudo || firstName !== user.firstName || lastName !== user.lastName)
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [pseudo, firstName, lastName]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Submit');

        // récupérer les données du formulaire
        const userData: UserParams = {
            pseudo: pseudo,
            firstName: firstName,
            lastName: lastName
        }
        // vérifier/valider les données
        // TODO faire méthode
        if(!(pseudo.length > MIN_LENGTH 
            && firstName.length > MIN_LENGTH 
            && lastName.length > MIN_LENGTH
            && pseudo.length <= MAX_LENGTH_PSEUDO
            && firstName.length <= MAX_LENGTH
            && lastName.length <= MAX_LENGTH
            && (pseudo !== user.pseudo || firstName !== user.firstName || lastName !== user.lastName)
        )) {
            return;
        }
    
        // faire requete : dans userService
        const response = await userService.updateUserParams(userData);

        if(!response) {
            ToastFacade.error('Erreur : Erreur lors de la mise à jour !');
            return;
        } 

        try {
            const data = await response.json();
            if(response.status === 201) {
                loadUser();
                handleCloseEditUserModal();
                ToastFacade.success('Mise à jour reussie : ' + data.message + ' !');
            } else if(response.status === 409) {
                // afficher un message dans un toast (ex : nouveau pseudo deja pris)
                //console.log('Le nouveau pseudo est deja pris');
                ToastFacade.error('Erreur : ' + data.message + ' !');
            } else {
                // afficher un message dans un toast (ex : erreur lors de la mise à jour)
                //console.log('Erreur lors de la mise à jour');
                ToastFacade.error('Erreur : ' + data.message + ' !');
            }
        }
        catch (error) {
            console.error(error);
            ToastFacade.error('Mise à jour échouée : ' + error + ' !');
            return;
        }
    }

    

    return (
        <Modal
            size="lg"
            className="modal-dark"
            show={isModalEditUserOpen} 
            onHide={handleCloseEditUserModal} 
            centered
        >
            <Modal.Header className="modal-dark-header">
                <Modal.Title>Modifier les paramètres</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body">
                <Form className="react-form" noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formPseudo">
                        <Form.Label className="mb-0" >Pseudo</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="pseudo"
                            className="react-input mt-0"
                            onChange={(e) => setPseudo(e.target.value)}
                            defaultValue={user.pseudo}
                            placeholder="Pseudo"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formFirstName">
                        <Form.Label className="mb-0" >Prénom</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="firstName"
                            className="react-input mt-0"
                            onChange={(e) => setFirstName(e.target.value)}
                            defaultValue={user.firstName}
                            placeholder="Prénom"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formLastName">
                        <Form.Label className="mb-0" >Nom</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="lastName"
                            className="react-input mt-0"
                            onChange={(e) => setLastName(e.target.value)}
                            defaultValue={user.lastName}
                            //value={lastName}
                            placeholder="Nom"
                            required
                        />
                    </Form.Group>
                    <Button disabled={!isFormValid} variant="primary" type="submit">Modifier</Button>
                </Form>

            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseEditUserModal} type="button">Fermer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEditUser;