<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\VerificationToken;
use App\Repository\VerificationTokenRepository;
use Doctrine\ORM\EntityManagerInterface;

class AccountService
{
    public function __construct(
        private EntityManagerInterface $em,
        private MailerService $mailer,
        private VerificationTokenRepository $verificationTokenRepository
    ) {
    }

    public function sendVerificationEmail(User $user): void
    {
        // 1. Génération du token unique
        $tokenValue = null;
        do {
            $tokenValue = bin2hex(random_bytes(32));
            $existingToken = $this->verificationTokenRepository->findOneBy(['token' => $tokenValue]);
        } while ($existingToken !== null);

        // 2. Création de l'entité Token
        $token = new VerificationToken();
        $token->setToken($tokenValue);
        //$token->setUser($user); // On lie le token au user
        $user->addVerificationToken($token);

        // 3. Enregistrement
        $this->em->persist($token);
        // Si le user vient d'être créé, il faut aussi le persist, sinon non
        $this->em->persist($user); 
        
        $this->em->flush();

        // 4. Envoi de l'email
        $this->mailer->sendVerificationEmail($user, $tokenValue);
    }

    public function isAllTokensExpired(User $user): bool
    {
        $tokens = $user->getVerificationTokens();
        //$isAllTokensExpired = true;
        if(empty($tokens)) {
            return true;
        }
        foreach ($tokens as $token) {
            if($token->getExpiresAt() > new \DateTime()) {
                return false;
            }
        }
        return true;
    }
}
