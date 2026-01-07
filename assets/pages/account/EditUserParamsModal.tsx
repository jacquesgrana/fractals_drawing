import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { UserInfo, UserParams } from '../../types/indexType';
import UserService from '../../services/UserService';
import ToastFacade from '../../facade/ToastFacade';
import UserConfig from '../../config/UserConfig';

type EditUserParamsModalProps = {
    isModalEditUserParamsOpen: boolean,
    handleCloseEditUserParamsModal: () => void,
    loadUser: () => void,
    user: UserInfo
}

const EditUserParamsModal = ({ 
        isModalEditUserParamsOpen, 
        handleCloseEditUserParamsModal, 
        user,
        loadUser
    } : EditUserParamsModalProps
) : React.ReactElement => {
    // TODO mettre dans config !!
    //const MIN_LENGTH = 3;
    //const MAX_LENGTH_PSEUDO = 15;
    //const MAX_LENGTH = 30;
    //const [isLoading, setIsLoading] = useState(false);
    const [pseudo, setPseudo] = useState<string>(user.pseudo);
    const [firstName, setFirstName] = useState<string>(user.firstName);
    const [lastName, setLastName] = useState<string>(user.lastName);

    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    const userService = UserService.getInstance();

    useEffect(() => {

        // TODO faire méthodes
        if (
            pseudo.length >= UserConfig.PSEUDO_MIN_LENGTH 
            && firstName.length >= UserConfig.NAME_MIN_LENGTH 
            && lastName.length >= UserConfig.NAME_MIN_LENGTH
            && pseudo.length <= UserConfig.PSEUDO_MAX_LENGTH
            && firstName.length <= UserConfig.NAME_MAX_LENGTH
            && lastName.length <= UserConfig.NAME_MAX_LENGTH
            && UserConfig.PSEUDO_REGEX.test(pseudo)
            && UserConfig.NAME_REGEX.test(firstName)
            && UserConfig.NAME_REGEX.test(lastName)
            && (pseudo !== user.pseudo || firstName !== user.firstName || lastName !== user.lastName)
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [pseudo, firstName, lastName]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //console.log('Submit');

        // récupérer les données du formulaire
        const userData: UserParams = {
            pseudo: pseudo,
            firstName: firstName,
            lastName: lastName
        }
        // vérifier/valider les données
        // TODO faire méthodes
        if(!isFormValid) {
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
                handleCloseEditUserParamsModal();
                ToastFacade.success('Mise à jour reussie : ' + data.message + ' !');
            } else if(response.status === 409) {
                // afficher un message dans un toast (ex : nouveau pseudo deja pris)
                //console.log('Le nouveau pseudo est deja pris');
                ToastFacade.error('Erreur 409 : ' + data.message + ' !');
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
            show={isModalEditUserParamsOpen} 
            onHide={handleCloseEditUserParamsModal} 
            centered
        >
            <Modal.Header className="modal-dark-header">
                <Modal.Title>Modifier les informations</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-dark-body">
                <Form className="react-form" noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 w-75" controlId="formPseudo">
                        <Form.Label className="mb-0" >Pseudo</Form.Label>
                        <Form.Control 
                            min={UserConfig.PSEUDO_MIN_LENGTH}
                            max={UserConfig.PSEUDO_MAX_LENGTH}
                            type="text" 
                            name="pseudo"
                            className="react-input mt-0"
                            onChange={(e) => setPseudo(e.target.value)}
                            defaultValue={user.pseudo}
                            placeholder="Pseudo"
                            title={`Le pseudo doit être composé de lettres (majuscules et minuscules), chiffres, tirets et underscores et faire entre ${UserConfig.PSEUDO_MIN_LENGTH} et ${UserConfig.PSEUDO_MAX_LENGTH} caractères`}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 w-75" controlId="formFirstName">
                        <Form.Label className="mb-0" >Prénom</Form.Label>
                        <Form.Control 
                            min={UserConfig.NAME_MIN_LENGTH}
                            max={UserConfig.NAME_MAX_LENGTH}
                            type="text" 
                            name="firstName"
                            className="react-input mt-0"
                            onChange={(e) => setFirstName(e.target.value)}
                            defaultValue={user.firstName}
                            placeholder="Prénom"
                            title={`Le prénom doit faire entre ${UserConfig.NAME_MIN_LENGTH} et ${UserConfig.NAME_MAX_LENGTH} caractères et composé de lettres (majuscules et minuscules) et tirets`}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 w-75" controlId="formLastName">
                        <Form.Label className="mb-0" >Nom</Form.Label>
                        <Form.Control 
                            min={UserConfig.NAME_MIN_LENGTH}
                            max={UserConfig.NAME_MAX_LENGTH}
                            type="text" 
                            name="lastName"
                            className="react-input mt-0"
                            onChange={(e) => setLastName(e.target.value)}
                            defaultValue={user.lastName}
                            //value={lastName}
                            placeholder="Nom"
                            title={`Le nom doit faire entre ${UserConfig.NAME_MIN_LENGTH} et ${UserConfig.NAME_MAX_LENGTH} caractères et composé de lettres (majuscules et minuscules) et tirets`}
                            required
                        />
                    </Form.Group>
                    <Button disabled={!isFormValid} variant="primary" type="submit">Modifier</Button>
                </Form>

            </Modal.Body>
            <Modal.Footer className="modal-dark-footer">
                <Button variant="primary" onClick={handleCloseEditUserParamsModal} type="button">Fermer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditUserParamsModal;