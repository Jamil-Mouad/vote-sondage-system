-- Migration: Ajouter les champs poll_type et show_results_on_vote
-- Date: 2025-12-26
-- Description: Ajoute le support pour les types de sondages (poll, vote, binary_poll)

USE neoVote;

-- Ajouter la colonne options si elle n'existe pas (pour compatibilité)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'neoVote'
    AND TABLE_NAME = 'polls'
    AND COLUMN_NAME = 'options'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE polls ADD COLUMN options JSON NOT NULL AFTER description',
    'SELECT "Column options already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter poll_type
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS poll_type ENUM('poll', 'vote', 'binary_poll') DEFAULT 'poll' AFTER status;

-- Ajouter show_results_on_vote
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS show_results_on_vote BOOLEAN DEFAULT TRUE AFTER poll_type;

-- Créer l'index sur poll_type
CREATE INDEX IF NOT EXISTS idx_polls_poll_type ON polls(poll_type);

-- Mettre à jour les sondages existants
UPDATE polls
SET poll_type = 'poll', show_results_on_vote = TRUE
WHERE poll_type IS NULL;

-- Afficher un message de confirmation
SELECT 'Migration completed successfully!' AS message;
