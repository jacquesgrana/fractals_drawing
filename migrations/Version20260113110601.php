<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260113110601 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE julia_fractal (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, name VARCHAR(128) NOT NULL, seed_real DOUBLE PRECISION NOT NULL, seed_imag DOUBLE PRECISION NOT NULL, escape_limit DOUBLE PRECISION NOT NULL, max_iterations INT NOT NULL, is_public TINYINT(1) NOT NULL, INDEX IDX_7F4437CAA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE julia_fractal ADD CONSTRAINT FK_7F4437CAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE julia_fractal DROP FOREIGN KEY FK_7F4437CAA76ED395');
        $this->addSql('DROP TABLE julia_fractal');
    }
}
