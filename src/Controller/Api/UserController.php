<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\EmailVerificationCode;
use App\Repository\UserRepository;
use App\Repository\VerificationTokenRepository;
use App\Service\AccountService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/user', name: 'api_user_')]
class UserController extends AbstractController
{

    #[Route('/list', name: 'index', methods: ['GET'])]
    public function list(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $usersDTO = [];

        foreach ($users as $user) {
            $usersDTO[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'pseudo' => $user->getPseudo(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'), 
                'updatedAt' => $user->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ];
        }

        return $this->json([
            'message' => "Liste des utilisateurs",
            'status' => 200,
            'data' => [
                'users' => $usersDTO
            ]
        ], 200);
    }


    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        EntityManagerInterface $em, 
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        UserRepository $userRepository,
        AccountService $accountService
        ): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }

        if(
            empty($data['email']) ||
            empty($data['password']) ||
            empty($data['pseudo']) ||
            empty($data['firstName']) ||
            empty($data['lastName'])
        ) {
            return $this->json([
                'message' => "Tous les champs sont obligatoires",
                'status' => 400,
                'data' => []
                // 'status' n'est pas standard dans le corps JSON, le code HTTP suffit, 
                // mais je le laisse si ton front l'attend ainsi.
            ], 400);
        }

        if(
            $userRepository->findOneBy(['email' => $data['email']])
        ) {
            return $this->json([
                'message' => "Cet email existe deja",
                'status' => 400,
                'data' => []
            ], 400);
        }

        if(
            $userRepository->findOneBy(['pseudo' => $data['pseudo']])
        ) {
            return $this->json([
                'message' => "Ce pseudo existe deja",
                'status' => 400,
                'data' => []
            ], 400);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPseudo($data['pseudo']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setRoles(['ROLE_USER']);
        //$user->setCreatedAt(new \DateTimeImmutable());
        // createdAt est géré ici ou via le LifecycleCallback que je t'ai fait ajouter avant
        
        // 5. Hachage du mot de passe
        $hashedPassword = $passwordHasher->hashPassword(
            $user, 
            $data['password']
        );
        $user->setPassword($hashedPassword);

        // TODO : utiliser un fichier de config pour les 15 minutes
        
        /*
        $tokenValue = null;
        
        do {
            $tokenValue = bin2hex(random_bytes(32));
            
            $existingToken = $verificationTokenRepository->findOneBy(['token' => $tokenValue]);
            
        } while ($existingToken !== null);

        $token = new \App\Entity\VerificationToken();
        
        $token->setToken($tokenValue);
        //$token->setExpiresAt(new \DateTimeImmutable('+15 minutes'));
        //$token->setUser($user);
        $user->addVerificationToken($token);
        

        // 6. Enregistrement en base de données
        $em->persist($user);
        $em->persist($token);
        $em->flush();

        // 7. Envoi de l'email de vérification de compte avec un lien de confirmation contenant le token de confirmation

        $mailer->sendVerificationEmail($user, $tokenValue);
        */

        $em->persist($user);
        $em->flush();
        //$accountService = $this->get(AccountService::class);
        $accountService->sendVerificationEmail($user);

        return $this->json([
            'message' => "Inscription Réussie : Email de vérification envoyé",
            'status' => 201,
            'data' => [
                'user' => [
                    'email' => $user->getEmail(),
                    'pseudo' => $user->getPseudo(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $user->getUpdatedAt()->format('Y-m-d H:i:s')
                ]
            ]
        ], 201); // 201 = Created
    }

    #[Route('/verify-email', name: 'verify_email', methods: ['POST'])]
    public function verifyEmail(
        EntityManagerInterface $em, 
        Request $request,
        VerificationTokenRepository $verificationTokenRepository
    )
    {
        try {
            $data = $request->toArray();
        } 
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }

        if(empty($data['token']) || empty($data['email'])
        ) {
            return $this->json([
                'message' => 'Données manquantes',
                'status' => 400,
                'data' => []
            ], 400);
        }

        $token = $verificationTokenRepository->findOneBy(['token' => $data['token']]);

        if(!$token) {
            return $this->json([
                'message' => 'Token invalide',
                'status' => 400,
                'data' => []
            ], 400);
        }

        $user = $token->getUser();

        if(!$user) {
            return $this->json([
                'message' => 'Utilisateur non trouvé',
                'status' => 400,
                'data' => []
            ]);
        }

        if($user->isVerified()) {
            return $this->json([
                'message' => 'Utilisateur déjà vérifié',
                'status' => 400,
                'data' => []
            ], 400);
        }

        if($user->getEmail() !== $data['email']) {
            return $this->json([
                'message' => 'Token et email ne correspondent pas',
                'status' => 400,
                'data' => []
            ], 400);
        }

        if($token->getExpiresAt() < new \DateTimeImmutable()) {
            $em->remove($token);
            $em->flush();
            return $this->json([
                'message' => 'Token expiré',
                'status' => 400,
                'data' => []
            ], 400);
        }

        $user->setIsVerified(true);
        // supprimer tous les tokens de l'user
        $user->getVerificationTokens()->clear();
        //$user->removeVerificationToken($token);
        $em->persist($user);
        //$em->remove($token);
        $em->flush();
        
        return $this->json([
            'message' => "Adresse email verifiée",
            'status' => 201,
            'data' => [
                "email" => $user->getEmail()
            ]
        ], 201); // 201 = Created
    }

    #[Route('/patch-params', name: 'patch_user_params', methods: ['PATCH'])]
    public function patchUserParams(
        EntityManagerInterface $em, 
        Request $request
    )
    {
        try {
            $data = $request->toArray();
        } 
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }

        if(empty($data['pseudo']) || empty($data['firstName']) || empty($data['lastName'])
        ) {
            return $this->json([
                'message' => 'Données manquantes',
                'status' => 400,
                'data' => []
            ], 400);
        }

        // vérifier que le pseudo n'est pas déjà utilisé
        $user = $this->getUser();

        $usersWithSamePseudo = $em->getRepository(User::class)->findBy(['pseudo' => $data['pseudo']]);

        if(count($usersWithSamePseudo) > 0) {
            foreach($usersWithSamePseudo as $userWithSamePseudo) {
                if($userWithSamePseudo->getEmail() !== $user->getUserIdentifier()) {
                    return $this->json([
                        'message' => 'Pseudo déjà utilisé',
                        'status' => 409,
                        'data' => []
                    ], 409);
                }
            }
        }
        /*
        if($userWithSamePseudo && $userWithSamePseudo->getEmail() !== $user->getUserIdentifier()) {
            return $this->json([
                'message' => 'Pseudo déjà utilisé',
                'status' => 409,
                'data' => []
            ], 409);
        }
        */
        

        $userFromBd = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if(!$userFromBd) {
            return $this->json([
                'message' => 'Utilisateur non trouvé',
                'status' => 404,
                'data' => []
            ], 404);
        }

        if($userFromBd->getPseudo() !== $data['pseudo']) $userFromBd->setPseudo($data['pseudo']);
        if($userFromBd->getFirstName() !== $data['firstName']) $userFromBd->setFirstName($data['firstName']);
        if($userFromBd->getLastName() !== $data['lastName']) $userFromBd->setLastName($data['lastName']);

        $em->persist($userFromBd);
        $em->flush();

        return $this->json([
            'message' => "Paramètres modifiés",
            'status' => 201,
            'data' => [
                "email" => $userFromBd->getEmail(),
                "pseudo" => $userFromBd->getPseudo(),
                "firstName" => $userFromBd->getFirstName(),
                "lastName" => $userFromBd->getLastName(),
                'createdAt' => $userFromBd->getCreatedAt()->format('Y-m-d H:i:s'), 
                'updatedAt' => $userFromBd->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ], 201); // 201 = Created
    }

    #[Route('/patch-email', name: 'patch_email', methods: ['PATCH'])]
    public function patchEmail(
        EntityManagerInterface $em, 
        Request $request
    ) {

        try {
            $data = $request->toArray();
        } 
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }

        if(empty($data['email'])) {
            return $this->json([
                'message' => 'Données manquantes',
                'status' => 400,
                'data' => []
            ], 400);
        }

        // vérifier que l'email n'est pas deja utilisé
        $user = $this->getUser();

        $userWithSameEmail = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if($userWithSameEmail && $userWithSameEmail->getEmail() !== $user->getUserIdentifier()) {
            return $this->json([
                'message' => 'Email déjà utilisé',
                'status' => 409,
                'data' => []
            ], 409);
        }

        $userFromBd = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if(!$userFromBd) {
            return $this->json([
                'message' => 'Utilisateur non trouvé',
                'status' => 404,
                'data' => []
            ], 404);
        }

        if($userFromBd->getEmail() !== $data['email']) $userFromBd->setEmail($data['email']);

        // TODO : vider les codes de vérification de l'user
        $userFromBd->getEmailVerificationCodes()->clear();
        $em->persist($userFromBd);
        $em->flush();

        return $this->json([
            'message' => "Email modifié",
            'status' => 201,
            'data' => [
                "email" => $userFromBd->getEmail(),
                "pseudo" => $userFromBd->getPseudo(),
                "firstName" => $userFromBd->getFirstName(),
                "lastName" => $userFromBd->getLastName(),
                'createdAt' => $userFromBd->getCreatedAt()->format('Y-m-d H:i:s'), 
                'updatedAt' => $userFromBd->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    #[Route('/email-not-used', name: 'email_not_used', methods: ['POST'])]
    public function getEmailNonUsed(
        EntityManagerInterface $em, 
        Request $request
    ) {

        try {
            $data = $request->toArray();
        } 
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if($user)
        {
            return $this->json([
                'message' => 'Email déjà utilisé',
                'status' => 409,
                'data' => []
            ], 409);
            
        } else {
            return $this->json([
                'message' => 'Email non utilisé',
                'status' => 201,
                'data' => []
            ], 201);
        }
    }

    #[Route('/send-email-with-code', name: 'send_email_with_code', methods: ['POST'])]
    public function sendEmailWithCodeToEmail(
        Request $request,
        AccountService $accountService
    ) {
        try {
            $data = $request->toArray();
        }
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }
        $email = $data['email'];
        $user = $this->getUser();
        try {
           $isOk = $accountService->sendEmailWithCodeToEmail($user, $email);
           if(!$isOk) {
               return $this->json([
                   'message' => 'Email non envoyé - essayez plus tard',
                   'status' => 400,
                   'data' => []
               ], 400);
           }
           else {
                return $this->json([
                    'message' => 'Email envoyé',
                    'status' => 200,
                    'data' => []
                ], 200);
           }
             
        }
        catch (\Exception $e) {
            return $this->json([
                'message' => $e->getMessage(),
                'status' => 400,
                'data' => []
            ], 400);
        }
    }

    #[Route('/verify-email-code', name: 'verify_email_code', methods: ['POST'])]
    public function verifyEmailCode(
        EntityManagerInterface $em, 
        Request $request
    )
    {
        try {
            $data = $request->toArray();
        } 
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }
        $user = $this->getUser();
        $userFromDb = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if(!$user) {
            return $this->json([
                'message' => 'Utilisateur non trouvé',
                'status' => 404,
                'data' => []
            ], 404);
        }

        $verifCode = $em->getRepository(EmailVerificationCode::class)->findOneBy(['email' => $data['email'], 'code' => $data['code']]);

        if($verifCode && $verifCode->getExpiresAt() > new \DateTime() && $verifCode->getUser()->getId() === $userFromDb->getId()) {
            //$user->setEmailVerified(true);
            //$em->persist($user);
            //$em->flush();
            return $this->json([
                'message' => 'Email verifié',
                'status' => 200,
                'data' => []
            ], 200);
        } 
        else {
            return $this->json([
                'message' => 'Code de vérification incorrect',
                'status' => 400,
                'data' => []
            ], 400);
        }
    }
}