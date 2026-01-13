<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\JuliaFractal;
use App\Repository\JuliaFractalRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

#[Route('/api/julia-fractal', name: 'julia_fractal_', methods: ['GET'])]
class JuliaFractalController extends AbstractController
{
    #[Route('/get-all', name: 'get_all', methods: ['GET'])]
    public function getAll(JuliaFractalRepository $juliaFractalRepository): Response
    {
        $juliaFractals = $juliaFractalRepository->findAll();
        return $this->json([
            'message' => "Liste des fractales de julia",
            'status' => 200,
            'data' => [
                'juliaFractals' => $juliaFractals
            ]
        ], 200);
    }


    #[Route('/get-public', name: 'get_public', methods: ['GET'])]
    public function getPublic(JuliaFractalRepository $juliaFractalRepository): Response
    {
        $juliaFractals = $juliaFractalRepository->findBy(['isPublic' => true]);
        return $this->json([
            'message' => "Liste des fractales de julia publiques",
            'status' => 200,
            'data' => [
                'juliaFractals' => $juliaFractals
            ]
        ], 200);
    }

    #[Route('/get-from-current-user', name: 'get_from_current_user', methods: ['GET'])]
    public function getFromCurrentUser(
        JuliaFractalRepository $juliaFractalRepository,
        UserRepository $userRepository): Response
    {
        $user = $userRepository->findBy(['email' => $this->getUser()->getUserIdentifier()]);
        if (!$user) {
            return $this->json([
                'message' => "Utilisateur non trouvé",
                'status' => 404,
                'data' => []
            ], 404);
        }
        $juliaFractals = $juliaFractalRepository->findBy(['user' => $user]);
        return $this->json([
            'message' => "Liste des fractales de julia de l'utilisateur connecté",
            'status' => 200,
            'data' => [
                'juliaFractals' => $juliaFractals
            ]
        ], 200);
    }
}