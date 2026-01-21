<?php

namespace App\Entity;

use App\Repository\JuliaFractalRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: JuliaFractalRepository::class)]
#[ORM\HasLifecycleCallbacks] // pour appeler les hooks pour 'createdAt' et 'updatedAt'
class JuliaFractal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 128)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $seedReal = null;

    #[ORM\Column]
    private ?float $seedImag = null;

    #[ORM\Column]
    private ?float $escapeLimit = null;

    #[ORM\Column]
    private ?int $maxIterations = null;

    #[ORM\Column]
    private ?bool $isPublic = null;

    #[ORM\ManyToOne(inversedBy: 'juliaFractals')]
    private ?User $user = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $comment = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTime $updatedAt = null;

    #[ORM\PrePersist]
    public function setInitialValues(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTime(); 
        //$this->isPublic = true;
    }

    #[ORM\PreUpdate]
    public function setUpdatedValues(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSeedReal(): ?float
    {
        return $this->seedReal;
    }

    public function setSeedReal(float $seedReal): static
    {
        $this->seedReal = $seedReal;

        return $this;
    }

    public function getSeedImag(): ?float
    {
        return $this->seedImag;
    }

    public function setSeedImag(float $seedImag): static
    {
        $this->seedImag = $seedImag;

        return $this;
    }

    public function getEscapeLimit(): ?float
    {
        return $this->escapeLimit;
    }

    public function setEscapeLimit(float $escapeLimit): static
    {
        $this->escapeLimit = $escapeLimit;

        return $this;
    }

    public function getMaxIterations(): ?int
    {
        return $this->maxIterations;
    }

    public function setMaxIterations(int $maxIterations): static
    {
        $this->maxIterations = $maxIterations;

        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;

        return $this;
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

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

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

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function normalize(): array
    {
        $user = $this->getUser() ? ['pseudo' => $this->getUser()->getPseudo()] : null;
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'seedReal' => $this->getSeedReal(),
            'seedImag' => $this->getSeedImag(),
            'escapeLimit' => $this->getEscapeLimit(),
            'maxIterations' => $this->getMaxIterations(),
            'isPublic' => $this->isPublic(),
            'user' => $user,
            'comment' => $this->getComment(),
            'createdAt' => $this->getCreatedAt(),
            'updatedAt' => $this->getUpdatedAt(),
        ];
    }
}
