<?php

namespace App\Controller\Api;

use App\Entity\Favorite;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\JuliaFractal;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/favorite', name: 'favorite_')]
class FavoriteController extends AbstractController
{

    #[Route('/toggle', name: 'toggle', methods: ['POST'])]
    public function like(
        EntityManagerInterface $em,
        Request $request
        ): Response
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

        if (!isset($data['juliaFractalId'])) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }

        $julia = $em->getRepository(JuliaFractal::class)->findOneBy(['id' => $data['juliaFractalId']]);
        if (!$julia) {
            return $this->json([
                'message' => "Fractale de julia non rencontrée",
                'status' => 404,
                'data' => []
            ], 404);
        }

        $user = $this->getUser(); // L'utilisateur connecté
        if (!$user) {
            return $this->json([
                'message' => 'Unauthorized',
                'status' => 401,
                'data' => []
                ], 401);
        }
        $userFromDb = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if (!$userFromDb) {
            return $this->json([
                'message' => "Utilisateur non rencontré",
                'status' => 404,
                'data' => []
            ], 404);
        }

        $existingFavorite = $em->getRepository(Favorite::class)->findOneBy([
            'user' => $userFromDb,
            'juliaFractal' => $julia
        ]);

        if ($existingFavorite) {
            $userFromDb->removeFavorite($existingFavorite);
            $julia->removeFavorite($existingFavorite);
            $em->remove($existingFavorite);
            $em->persist($userFromDb);
            $em->persist($julia);
            $em->flush();
            
            return $this->json([
                'message' => "Like supprimé",
                'status' => 200,
                'data' => [
                    'liked' => false
                ]
                ], 200);
               
        }

        // Option B : Création du like
        $like = new Favorite();
        $userFromDb->addFavorite($like);
        $julia->addFavorite($like);

        //$like->setUser($userFromDb);
        //$like->setJuliaFractal($julia);

        $em->persist($like);
        $em->persist($userFromDb);
        $em->persist($julia);
        $em->flush();

        return $this->json([
            'message' => "Like ajouté",
            'status' => 201,
            'data' => [
                'liked' => true
            ]
        ], 201);
    }


    #[Route('/user-favorites', name: 'user_favorites', methods: ['GET'])]
    public function getUserFavorites(
        EntityManagerInterface $em
        ): Response {
        $user = $this->getUser(); // L'utilisateur connecté
        if (!$user) {
            return $this->json([
                'message' => 'Unauthorized',
                'status' => 401,
                'data' => []
                ], 401);
        }
        $userFromDb = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if (!$userFromDb) {
            return $this->json([
                'message' => "Utilisateur non rencontré",
                'status' => 404,
                'data' => []
            ], 404);
        }
        $favorites = [];
        foreach ($userFromDb->getFavorites() as $favorite) { 
            $favorites[] = $favorite->normalizeShallow();
        }
        return $this->json([
            'message' => "Liste des favoris de l'utilisateur",
            'status' => 200,
            'data' => [ "favorites" => $favorites ]
        ], 200);
            
    }

}