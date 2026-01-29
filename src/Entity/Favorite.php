<?php

namespace App\Entity;

use App\Repository\FavoriteRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
// 1. Contrainte au niveau SQL (Base de données)
#[ORM\UniqueConstraint(name: 'unique_user_favorite', columns: ['user_id', 'julia_fractal_id'])]
// 2. Contrainte au niveau Symfony (Validation API/Form)
#[UniqueEntity(
    fields: ['user', 'juliaFractal'],
    message: 'Vous avez déjà ajouté cette fractale à vos favoris.'
)]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'favorites')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'favorites')]
    #[ORM\JoinColumn(nullable: false)]
    private ?JuliaFractal $juliaFractal = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getJuliaFractal(): ?JuliaFractal
    {
        return $this->juliaFractal;
    }

    public function setJuliaFractal(?JuliaFractal $juliaFractal): static
    {
        $this->juliaFractal = $juliaFractal;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function normalizeDeep(): array
    {
        return [
            'id' => $this->getId(),
            'user' => $this->getUser()->normalizeShallow(),
            'juliaFractal' => $this->getJuliaFractal()->normalizeShallow(),
            'createdAt' => $this->getCreatedAt(),
        ];
    }

    public function normalizeShallow(): array
    {
        return [
            'id' => $this->getId(),
            'user' => [
                'id' => $this->getUser()->getId(),
                'pseudo' => $this->getUser()->getPseudo()
                ],
            'juliaFractal' => ['id' => $this->getJuliaFractal()->getId()],
            'createdAt' => $this->getCreatedAt(),
        ];
    }

}
