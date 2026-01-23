<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\JuliaFractalRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use App\Entity\JuliaFractal;

#[Route('/api/julia-fractal', name: 'julia_fractal_', methods: ['GET'])]
class JuliaFractalController extends AbstractController
{
    #[Route('/get-all', name: 'get_all', methods: ['GET'])]
    public function getAll(JuliaFractalRepository $juliaFractalRepository): Response
    {
        $juliaFractals = $juliaFractalRepository->findAll();

        $toReturn = [];
        foreach ($juliaFractals as $juliaFractal) {
            $toReturn[] = $juliaFractal->normalize();
        }

        return $this->json([
            'message' => "Liste des fractales de julia",
            'status' => 200,
            'data' => [
                'juliaFractals' => $toReturn
            ]
        ], 200);
    }


    #[Route('/get-public', name: 'get_public', methods: ['GET'])]
    public function getPublic(JuliaFractalRepository $juliaFractalRepository): Response
    {
        $juliaFractals = $juliaFractalRepository->findBy(['isPublic' => true]);
        $toReturn = [];
        foreach ($juliaFractals as $juliaFractal) {
            $toReturn[] = $juliaFractal->normalize();
        }
        
        return $this->json([
            'message' => "Liste des fractales de julia publiques",
            'status' => 200,
            'data' => [
                'juliaFractals' => $toReturn
            ]
        ], 200);
    }

    #[Route('/get-from-current-user', name: 'get_from_current_user', methods: ['GET'])]
    public function getFromCurrentUser(
        JuliaFractalRepository $juliaFractalRepository,
        UserRepository $userRepository): Response
    {
        $user = $this->getUser();
        $userFromDb = $userRepository->findBy(['email' => $user->getUserIdentifier()]);
        if (!$userFromDb) {
            return $this->json([
                'message' => "Utilisateur non trouvé",
                'status' => 404,
                'data' => []
            ], 404);
        }
        $juliaFractals = $juliaFractalRepository->findBy(['user' => $userFromDb]);
        $toReturn = [];
        foreach ($juliaFractals as $juliaFractal) {
            $toReturn[] = $juliaFractal->normalize();
        }
        
        return $this->json([
            'message' => "Liste des fractales de julia de l'utilisateur connecté",
            'status' => 200,
            'data' => [
                'juliaFractals' => $toReturn
            ]
        ], 200);
    }

    #[Route('/get-without-user', name: 'get_without_user', methods: ['GET'])]
    public function getWithoutUser(JuliaFractalRepository $juliaFractalRepository): Response
    {
        $juliaFractals = $juliaFractalRepository->findBy(['user' => null]);
        return $this->json([
            'message' => "Liste des fractales de julia sans utilisateur",
            'status' => 200,
            'data' => [
                'juliaFractals' => $juliaFractals
            ]
        ], 200);
    }

    #[Route('/add-to-user', name: 'add_to_user', methods: ['POST'])]
    public function addJuliaFractalToUser(
        EntityManagerInterface $em,
        Request $request
        ): Response {
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
        if (!$userFromDb) {
            return $this->json([
                'message' => "Utilisateur non trouvé",
                'status' => 404,
                'data' => []
            ], 404);
        }
        $juliaFractal = $em->getRepository(JuliaFractal::class)->findOneBy(['id' => $data['juliaFractalId']]);
        if (!$juliaFractal) {
            return $this->json([
                'message' => "Fractal de julia non trouvée",
                'status' => 404,
                'data' => []
            ], 404);
        }
        $juliaFractalClone = new JuliaFractal();
        $juliaFractalClone->setName($juliaFractal->getName());
        $juliaFractalClone->setSeedReal($juliaFractal->getSeedReal());
        $juliaFractalClone->setSeedImag($juliaFractal->getSeedImag());
        $juliaFractalClone->setEscapeLimit($juliaFractal->getEscapeLimit());
        $juliaFractalClone->setMaxIterations($juliaFractal->getMaxIterations());
        $juliaFractalClone->setIsPublic(false);
        $juliaFractalClone->setComment($juliaFractal->getComment());
         
        $userFromDb->addJuliaFractal($juliaFractalClone);
        $em->persist($juliaFractalClone);
        $em->persist($userFromDb);
        $em->flush();

        return $this->json([
            'message' => "Utilisateur modifié",
            'status' => 200,
            'data' => [
                'user' => [
                    'id' => $userFromDb->getId(),
                'email' => $userFromDb->getEmail(),
                'pseudo' => $userFromDb->getPseudo(),
                'firstName' => $userFromDb->getFirstName(),
                'lastName' => $userFromDb->getLastName(),
                'createdAt' => $userFromDb->getCreatedAt()?->format('Y-m-d H:i:s'), 
                'updatedAt' => $userFromDb->getUpdatedAt()?->format('Y-m-d H:i:s'),
                ]
            ]
        ], 200);
    }

    // /api/julia-fractal/update-to-user

    #[Route('/update-to-user', name: 'update_to_user', methods: ['PUT'])]
    public function updateJuliaFractalToUser(
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

        $user = $this->getUser();
        $userFromDb = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
        if (!$userFromDb) {
            return $this->json([
                'message' => "Utilisateur non rencontré",
                'status' => 404,
                'data' => []
            ], 404);
        }
        $juliaFractal = $em->getRepository(JuliaFractal::class)->findOneBy(['id' => $data['juliaFractalId']]);
        if (!$juliaFractal) {
            return $this->json([
                'message' => "Fractale de julia non rencontrée",
                'status' => 404,
                'data' => []
            ], 404);
        }

        if (!$userFromDb->getJuliaFractals()->contains($juliaFractal)) {
            return $this->json([
                'message' => "Fractale de julia non rencontrée",
                'status' => 404,
                'data' => []
            ], 404);
        }

        $juliaFractal->setName($data['name']);
        $juliaFractal->setSeedReal($data['seedReal']);
        $juliaFractal->setSeedImag($data['seedImag']);
        $juliaFractal->setEscapeLimit($data['escapeLimit']);
        $juliaFractal->setMaxIterations($data['maxIterations']);
        $juliaFractal->setIsPublic($data['isPublic']);
        $juliaFractal->setComment($data['comment']);

        $em->persist($juliaFractal);
        //$em->persist($userFromDb);
        $em->flush();

        return $this->json([
            'message' => "Fractale modifiée",
            'status' => 200,
            'data' => [
                'juliaFractal' => [
                    'id' => $juliaFractal->getId(),
                    'name' => $juliaFractal->getName(),
                    'seedReal' => $juliaFractal->getSeedReal(),
                    'seedImag' => $juliaFractal->getSeedImag(),
                    'escapeLimit' => $juliaFractal->getEscapeLimit(),
                    'maxIterations' => $juliaFractal->getMaxIterations(),
                    'isPublic' => $juliaFractal->isPublic(),
                    'comment' => $juliaFractal->getComment(),
                ]
            ]
        ], 200);    
    }

    #[Route('/delete-from-user', name: 'delete_from_user', methods: ['DELETE'])]
    public function deleteJuliaFractalFromUser(
        EntityManagerInterface $em,
        Request $request
        ): Response {

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

        if (!$userFromDb) {
            return $this->json([
                'message' => "Utilisateur non rencontré",
                'status' => 404,
                'data' => []
            ], 404);
        }

        $juliaFractal = $em->getRepository(JuliaFractal::class)->findOneBy(['id' => $data['juliaFractalId']]);

        if (!$juliaFractal) {
            return $this->json([
                'message' => "Fractale de julia non trouvée",
                'status' => 404,
                'data' => []
            ], 404);
        }
        if(!$juliaFractal->getUser()) {
            return $this->json([
                'message' => "Fractale sans posseseur",
                'status' => 404,
                'data' => []
            ], 404);
        }
        if($juliaFractal->getUser()->getId() !== $userFromDb->getId()) {
            return $this->json([
                'message' => "Fractale de julia possédée par un autre utilisateur",
                'status' => 403,
                'data' => []
            ], 403);
        }
        $userFromDb->removeJuliaFractal($juliaFractal);
        $em->remove($juliaFractal);
        $em->persist($userFromDb);
        $em->flush();

        return $this->json([
            'message' => "Utilisateur modifié",
            'status' => 200,
            'data' => [
                'user' => [
                    'id' => $userFromDb->getId(),
                'email' => $userFromDb->getEmail(),
                'pseudo' => $userFromDb->getPseudo(),
                'firstName' => $userFromDb->getFirstName(),
                'lastName' => $userFromDb->getLastName(),
                'createdAt' => $userFromDb->getCreatedAt()?->format('Y-m-d H:i:s'), 
                'updatedAt' => $userFromDb->getUpdatedAt()?->format('Y-m-d H:i:s'),
                ]
            ]
        ], 200);
    }

    // /create-to-user

    #[Route('/create-to-user', name: 'create_to_user', methods: ['POST'])]
    public function createJuliaFractalToUser(
        EntityManagerInterface $em, 
        Request $request): Response
    {
        try {
            $data = $request->toArray();

            $user = $this->getUser();
            $userFromDb = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
            if (!$userFromDb) {
                return $this->json([
                    'message' => "Utilisateur non rencontré",
                    'status' => 404,
                    'data' => []
                ], 404);
            }

            if($data['isPublic'] === null) {
                $data['isPublic'] = false;
            }

            if($data['comment'] === null) {
                $data['comment'] = "";
            }

            if($data['name'] === null || $data['name'] === "") {
                return $this->json([
                    'message' => "Nom de la fractale de julia vide",
                    'status' => 400,
                    'data' => []
                ], 400);
            }

            $juliaFractal = new JuliaFractal();
            $juliaFractal->setSeedReal($data['seedReal']);
            $juliaFractal->setSeedImag($data['seedImag']);
            $juliaFractal->setEscapeLimit($data['escapeLimit']);
            $juliaFractal->setMaxIterations($data['maxIterations']);
            $juliaFractal->setIsPublic($data['isPublic']);
            $juliaFractal->setComment($data['comment']);
            $juliaFractal->setName($data['name']);
            $userFromDb->addJuliaFractal($juliaFractal);
            $em->persist($juliaFractal);
            $em->persist($userFromDb);
            $em->flush();
            return $this->json([
                'message' => "Fractale de julia créée",
                'status' => 200,
                'data' => [
                    'juliaFractal' => $juliaFractal->normalize()
                ]
            ], 200);
        } 
        catch (\Exception $e) {
            return $this->json([
                'message' => 'Données JSON invalides',
                'status' => 400,
                'data' => []
            ], 400);
        }
    }
}