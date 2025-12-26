
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) DEFAULT NULL,
  `option_d` VARCHAR(255) DEFAULT NULL,
  `correct` VARCHAR(32) NOT NULL COMMENT 'comma-separated option keys, e.g. "a" or "a,b"',
  `tags` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


