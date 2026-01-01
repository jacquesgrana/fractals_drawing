<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

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


    #[Route('/register', name: 'api_user_register', methods: ['POST'])]
    public function register(): JsonResponse
    {
        return $this->json([
            'message' => "Inscription Réussie",
            'status' => 200,
            'data' => []
        ], 200);
    }
}