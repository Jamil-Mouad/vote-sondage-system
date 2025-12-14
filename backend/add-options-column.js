// Script pour ajouter la colonne options à la table polls
const { pool } = require('./src/config/database');

async function addOptionsColumn() {
  try {
    console.log('Vérification de la structure de la table polls...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'neoVote' AND TABLE_NAME = 'polls' AND COLUMN_NAME = 'options'"
    );
    
    if (columns.length > 0) {
      console.log('La colonne "options" existe déjà.');
    } else {
      console.log('Ajout de la colonne "options"...');
      await pool.execute(
        "ALTER TABLE polls ADD COLUMN options JSON NOT NULL DEFAULT '[]' AFTER description"
      );
      console.log('Colonne "options" ajoutée avec succès !');
    }
    
    // Afficher la structure finale
    const [structure] = await pool.execute('DESCRIBE polls');
    console.log('\nStructure actuelle de la table polls:');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

addOptionsColumn();
