<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api', name: 'api_')]
class SecurityController extends AbstractController
{
    // C'est ici que le json_login du security.yaml va rediriger en cas de succès
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): Response
    {
        if (null === $user) {
            return $this->json([
                'status' => Response::HTTP_UNAUTHORIZED,
                'message' => 'Identifiants Incorrects',
                'data' => []
            ], Response::HTTP_UNAUTHORIZED);
        }

        // On renvoie l'utilisateur au format JSON
        return $this->json([
            'status' => Response::HTTP_OK,
            'message' => 'Connexion réussie',
            'data' => [
                'user' => [
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles(),
                    'pseudo' => $user->getPseudo(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $user->getUpdatedAt()->format('Y-m-d H:i:s')
                ]
            ],
            
        ], Response::HTTP_OK);
    }

    // React appellera cette route au chargement de la page pour savoir si l'utilisateur est déjà connecté
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(UserRepository $userRepository): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'status' => Response::HTTP_ACCEPTED,
                'message' => 'Utilisateur non connecté',
                'data' => []
            ], Response::HTTP_ACCEPTED);
        }

        $userReal = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);

        return $this->json([
            'status' => Response::HTTP_OK,
            'message' => 'Utilisateur connecté',
            'data' => [
                'user' => [
                    'email' => $user->getUserIdentifier(), // ou ->getEmail()
                    'roles' => $user->getRoles(),
                    'pseudo' => $userReal->getPseudo(),
                    'firstName' => $userReal->getFirstName(),
                    'lastName' => $userReal->getLastName(),
                    'createdAt' => $userReal->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $userReal->getUpdatedAt()->format('Y-m-d H:i:s')
                ]
            ]
            
        ], Response::HTTP_OK);
    }

    #[Route('/logout', name: 'logout', methods: ['GET'])]
    public function logout(): void
    {
        // Laisser vide, Symfony intercepte cette route grâce au security.yaml
    }
}
