<?php

namespace App\Security;

use App\Entity\User as AppUser;
use App\Service\AccountService; 
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;


class UserChecker implements UserCheckerInterface
{

    // Injection du service via le constructeur
    public function __construct(
        private AccountService $accountService
    ) {
    }

    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof AppUser) {
            return;
        }

        // Vérification 1 : Le compte est-il banni ?
        // On vérifie si isNotBanned est FALSE
        if (!$user->isNotBanned()) {
            // Cette exception renverra un message spécifique au login
            throw new CustomUserMessageAccountStatusException('Votre compte a été banni.');
        }

        if (!$user->isVerified()) {
            // OPTIONNEL : Renvoyer un email automatiquement
            // Attention : cela enverra un mail à CHAQUE tentative de connexion ratée.
            // Pour éviter le spam, tu pourrais vérifier la date du dernier token avant d'envoyer.

            // vérifier si pas token non expiré pour cet user
            // TODO mettre dans le service
            /*
            $tokens = $user->getVerificationTokens();
            $isAllTokensExpired = true;
            foreach ($tokens as $token) {
                if($token->getExpiresAt() > new \DateTime()) {
                    $isAllTokensExpired = false;
                    break;
                }
            }
            */

            if($this->accountService->isAllTokensExpired($user)) {
                $this->accountService->sendVerificationEmail($user);
            }

            // On bloque la connexion avec un message clair
            throw new CustomUserMessageAccountStatusException(
                'Votre compte n\'est pas activé. Si besoin, un email de vérification vous a été envoyé.'
            );
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        if (!$user instanceof AppUser) {
            return;
        }

        // Ici, tu peux mettre des vérifications à faire APRES que le mot de passe soit validé.
        // Par exemple, vérifier si le mot de passe a expiré.
    }
}
