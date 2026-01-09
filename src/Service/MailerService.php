<?php
//service chargé d'envoyer les mails
namespace App\Service;

use App\Entity\EmailVerificationCode;
use App\Entity\PasswordVerificationCode;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use App\Entity\User;

class MailerService
{
    private $mailer;

    private string $from;
    //private string $owner;
    private string $admin;
    //private string $admin = (isset($_ENV['EMAIL_ADMIN'])) ? $_ENV['EMAIL_ADMIN'] : '';

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
        $this->from = isset($_ENV['EMAIL_FROM']) ? $_ENV['EMAIL_FROM'] : '';
        //$this->owner = isset($_ENV['EMAIL_OWNER']) ? $_ENV['EMAIL_OWNER'] : '';
        // idem pour l'admin
        $this->admin = isset($_ENV['EMAIL_ADMIN']) ? $_ENV['EMAIL_ADMIN'] : '';
    }

    public function sendVerificationEmail($user, $tokenValue)
    {
        $email = (new TemplatedEmail())
            ->from($this->from)
            ->to($user->getEmail())
            ->subject('Vérification de votre compte')
            ->htmlTemplate('emails/registration/verification.html.twig')
            ->context([
                'user' => $user,
                'token' => $tokenValue
            ]);
        $this->mailer->send($email);
    }

    public function sendVerificationCodeEmail(User $user, EmailVerificationCode $verifCode) {
        $emailTosend = (new TemplatedEmail())
            ->from($this->from)
            ->to($verifCode->getEmail())
            ->subject('Vérification de la nouvelle adresse email')
            ->htmlTemplate('emails/account/verification_code.html.twig')
            ->context([
                'user' => $user,
                'code' => $verifCode->getCode(),
                'newEmail' => $verifCode->getEmail()
            ]);
        $this->mailer->send($emailTosend);
    }

    public function sendVerificationCodeEmailForPassword(User $user, PasswordVerificationCode $verifCode) {
        $emailTosend = (new TemplatedEmail())
            ->from($this->from)
            ->to($verifCode->getEmail())
            ->subject('Vérification de l\'adresse email')
            ->htmlTemplate('emails/account/verification_code.html.twig')
            ->context([
                'user' => $user,
                'code' => $verifCode->getCode(),
                'newEmail' => $verifCode->getEmail()
            ]);
        $this->mailer->send($emailTosend);
    }
}