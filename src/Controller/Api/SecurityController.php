<?php

namespace App\Controller\Api;

use App\Entity\User;
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
            return $this->json(['message' => 'Identifiants incorrects'], Response::HTTP_UNAUTHORIZED);
        }

        // On renvoie l'utilisateur au format JSON
        return $this->json([
            'user' => [
                'email' => $user->getEmail(),
                'roles' => $user->getRoles()
            ]
        ]);
    }

    // React appellera cette route au chargement de la page pour savoir si l'utilisateur est déjà connecté
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['user' => null], Response::HTTP_ACCEPTED);
        }

        return $this->json([
            'user' => [
                'email' => $user->getUserIdentifier(), // ou ->getEmail()
                'roles' => $user->getRoles()
            ], Response::HTTP_OK
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['GET'])]
    public function logout(): void
    {
        // Laisser vide, Symfony intercepte cette route grâce au security.yaml
    }
}
