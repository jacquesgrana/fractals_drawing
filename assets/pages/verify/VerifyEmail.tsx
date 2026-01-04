import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SecurityService from '../../services/SecurityService';
import ToastFacade from '../../facade/ToastFacade';

const VerifyEmail = () : React.ReactElement => {
    // Ce hook fonctionne exactement comme URLSearchParams en JS natif
    const [searchParams] = useSearchParams();

    // On extrait les valeurs
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [isWaiting, setIsWaiting] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    // On charge le service
    const securityService = SecurityService.getInstance();

    useEffect(() => {
        // Juste pour vérifier dans la console (F12)
        console.log("Token:", token);
        console.log("Email:", email);

        // On envoie une requête vers le backend
        const fct = async () => {
            if(!token || !email) return;
            try {
                // TODO améliorer : traiter la réponse
                const response = await securityService.verifyEmail(token, email);
                try {
                    const data = await response.json(); 
                    if (data.status === 201) {
                        setIsVerified(true);
                        ToastFacade.success('Vérification reussie : ' + data.message + ' !');
                    }
                    else if (data.status === 400) {
                        setIsVerified(false);
                        ToastFacade.error('Vérification échouée : ' + data.message + ' !');
                    }
                    else {
                        setIsVerified(false);
                        ToastFacade.error('Vérification échouée : ' + data.message + ' !');
                    }
                }
                catch (error) {
                    console.error(error);
                    setIsVerified(false);
                    ToastFacade.error('Vérification échouée : ' + error + ' !');
                }
                setIsWaiting(false);
                
                //console.log(data);
                
            } catch (error) {
                console.error(error);
            }
        };
        fct();
        
    }, [token, email]);

    return (
    <div className="react-card verify-page">
        <h2>Page de Vérification</h2>
        <p>Vérification de l'adresse email.</p>
        <ul>
            <li><strong>Email reçu :</strong> {email}</li>
            <li><strong>Token reçu :</strong> {token}</li>
        </ul>

        {isWaiting && <p>En cours de vérification...</p>}
        {!isWaiting && isVerified && <p>Adresse email vérifiée !</p>}
        {!isWaiting && !isVerified && <p>vérification échouée !</p>}
    </div>

    );
};
export default VerifyEmail;
