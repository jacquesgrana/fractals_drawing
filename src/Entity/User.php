<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Repository\VerificationTokenRepository;
use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\HasLifecycleCallbacks] // <--- 1. AJOUTE CETTE LIGNE OBLIGATOIREMENT
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 50)]
    private ?string $pseudo = null;

    #[ORM\Column(length: 255)]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    private ?string $lastName = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    private ?bool $isVerified = null;

    #[ORM\Column]
    private ?bool $isNotBanned = null;

    /**
     * @var Collection<int, VerificationToken>
     */
    #[ORM\OneToMany(targetEntity: VerificationToken::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $verificationTokens;

    /**
     * @var Collection<int, EmailVerificationCode>
     */
    #[ORM\OneToMany(targetEntity: EmailVerificationCode::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $emailVerificationCodes;

    /**
     * @var Collection<int, PasswordVerificationCode>
     */
    #[ORM\OneToMany(targetEntity: PasswordVerificationCode::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $passwordVerificationCodes;

    /**
     * @var Collection<int, JuliaFractal>
     */
    #[ORM\OneToMany(targetEntity: JuliaFractal::class, mappedBy: 'user')]
    private Collection $juliaFractals;

    /**
     * @var Collection<int, Favorite>
     */
    #[ORM\OneToMany(targetEntity: Favorite::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $favorites;

    public function __construct()
    {
        $this->verificationTokens = new ArrayCollection();
        $this->emailVerificationCodes = new ArrayCollection();
        $this->passwordVerificationCodes = new ArrayCollection();
        $this->juliaFractals = new ArrayCollection();
        $this->favorites = new ArrayCollection();
    }

    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0".self::class."\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated, to be removed when upgrading to Symfony 8
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

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

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

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function isNotBanned(): ?bool
    {
        return $this->isNotBanned;
    }

    public function setIsNotBanned(bool $isNotBanned): static
    {
        $this->isNotBanned = $isNotBanned;

        return $this;
    }

    #[ORM\PrePersist]
    public function setInitialValues(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTime(); 
        $this->isVerified = false;
        $this->isNotBanned = true;
    }

    #[ORM\PreUpdate]
    public function setUpdatedValues(): void
    {
        $this->updatedAt = new \DateTime();
    }

    /**
     * @return Collection<int, VerificationToken>
     */
    public function getVerificationTokens(): Collection
    {
        return $this->verificationTokens;
    }

    public function addVerificationToken(VerificationToken $verificationToken): static
    {
        if (!$this->verificationTokens->contains($verificationToken)) {
            $this->verificationTokens->add($verificationToken);
            $verificationToken->setUser($this);
        }

        return $this;
    }

    public function removeVerificationToken(VerificationToken $verificationToken): static
    {
        if ($this->verificationTokens->removeElement($verificationToken)) {
            // set the owning side to null (unless already changed)
            if ($verificationToken->getUser() === $this) {
                $verificationToken->setUser(null);
            }
        }

        return $this;
    }

    /*
    public function sendVerificationEmail(): void
    {
        // TODO : utiliser un fichier de config pour les 15 minutes
        
        $tokenValue = null;
        
        do {
            $tokenValue = bin2hex(random_bytes(32));
            
            $existingToken = $this->verificationTokenRepository->findOneBy(['token' => $tokenValue]);
            
        } while ($existingToken !== null);

        $token = new \App\Entity\VerificationToken();
        
        $token->setToken($tokenValue);
        //$token->setExpiresAt(new \DateTimeImmutable('+15 minutes'));
        //$token->setUser($user);
        $this->addVerificationToken($token);
        

        // 6. Enregistrement en base de données
        $this->em->persist($this);
        $this->em->persist($token);
        $this->em->flush();

        // 7. Envoi de l'email de vérification de compte avec un lien de confirmation contenant le token de confirmation

        $this->mailer->sendVerificationEmail($this, $tokenValue);
    }
    */

    /**
     * @return Collection<int, EmailVerificationCode>
     */
    public function getEmailVerificationCodes(): Collection
    {
        return $this->emailVerificationCodes;
    }

    public function addEmailVerificationCode(EmailVerificationCode $emailVerificationCode): static
    {
        if (!$this->emailVerificationCodes->contains($emailVerificationCode)) {
            $this->emailVerificationCodes->add($emailVerificationCode);
            $emailVerificationCode->setUser($this);
        }

        return $this;
    }

    public function removeEmailVerificationCode(EmailVerificationCode $emailVerificationCode): static
    {
        if ($this->emailVerificationCodes->removeElement($emailVerificationCode)) {
            // set the owning side to null (unless already changed)
            if ($emailVerificationCode->getUser() === $this) {
                $emailVerificationCode->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, PasswordVerificationCode>
     */
    public function getPasswordVerificationCodes(): Collection
    {
        return $this->passwordVerificationCodes;
    }

    public function addPasswordVerificationCode(PasswordVerificationCode $passwordVerificationCode): static
    {
        if (!$this->passwordVerificationCodes->contains($passwordVerificationCode)) {
            $this->passwordVerificationCodes->add($passwordVerificationCode);
            $passwordVerificationCode->setUser($this);
        }

        return $this;
    }

    public function removePasswordVerificationCode(PasswordVerificationCode $passwordVerificationCode): static
    {
        if ($this->passwordVerificationCodes->removeElement($passwordVerificationCode)) {
            // set the owning side to null (unless already changed)
            if ($passwordVerificationCode->getUser() === $this) {
                $passwordVerificationCode->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, JuliaFractal>
     */
    public function getJuliaFractals(): Collection
    {
        return $this->juliaFractals;
    }

    public function addJuliaFractal(JuliaFractal $juliaFractal): static
    {
        if (!$this->juliaFractals->contains($juliaFractal)) {
            $this->juliaFractals->add($juliaFractal);
            $juliaFractal->setUser($this);
        }

        return $this;
    }

    public function removeJuliaFractal(JuliaFractal $juliaFractal): static
    {
        if ($this->juliaFractals->removeElement($juliaFractal)) {
            // set the owning side to null (unless already changed)
            if ($juliaFractal->getUser() === $this) {
                $juliaFractal->setUser(null);
            }
        }

        return $this;
    }

    public function normalizeShallow(): array
    {
        return [
            'id' => $this->getId(),
            'pseudo' => $this->getPseudo(),
            'email' => $this->getEmail(),
            'firstName' => $this->getFirstName(),
            'lastName' => $this->getLastName(),
            //'roles' => $this->getRoles(),
            'createdAt' => $this->getCreatedAt(),
            'updatedAt' => $this->getUpdatedAt(),
        ];
    }

    /**
     * @return Collection<int, Favorite>
     */
    public function getFavorites(): Collection
    {
        return $this->favorites;
    }

    public function addFavorite(Favorite $favorite): static
    {
        if (!$this->favorites->contains($favorite)) {
            $this->favorites->add($favorite);
            $favorite->setUser($this);
        }

        return $this;
    }

    public function removeFavorite(Favorite $favorite): static
    {
        if ($this->favorites->removeElement($favorite)) {
            // set the owning side to null (unless already changed)
            if ($favorite->getUser() === $this) {
                $favorite->setUser(null);
            }
        }

        return $this;
    }
}
