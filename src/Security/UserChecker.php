<?php

namespace App\Security;

use App\Entity\User as AppUser;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
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

        // Vérification 2 : Le compte est-il vérifié ? (optionnel selon ta logique)
        if (!$user->isVerified()) {
            throw new CustomUserMessageAccountStatusException('Votre compte n\'est pas encore activé.');
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
