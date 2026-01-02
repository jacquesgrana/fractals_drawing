<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\VerificationTokenRepository;
use App\Service\MailerService;
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
        VerificationTokenRepository $verificationTokenRepository,
        MailerService $mailer
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
        $user->removeVerificationToken($token);
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
}