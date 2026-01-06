<?php

namespace App\Entity;

use App\Repository\EmailVerificationCodeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EmailVerificationCodeRepository::class)]
class EmailVerificationCode
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    #[ORM\Column(length: 8)]
    private ?string $code = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\ManyToOne(inversedBy: 'emailVerificationCodes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    public function __construct()
    {
        // 1. Définir l'expiration
        $this->expiresAt = new \DateTimeImmutable('+15 minutes');

        // 2. Générer le code
        $this->code = $this->generateCode(8);
    }

    /**
     * Génère un code alphanumérique de 8 caractères
     * En excluant les caractères qui portent à confusion (0, O, 1, I)
     */
    private function generateCode($size = 8): string
    {
        $alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $code = '';
        $max = strlen($alphabet) - 1;

        for ($i = 0; $i < $size; $i++) {
            // random_int est cryptographiquement plus sûr que rand()
            $code .= $alphabet[random_int(0, $max)];
        }

        return $code;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

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
}
