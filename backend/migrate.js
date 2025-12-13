const { pool } = require('./src/config/database');

async function migrate() {
  console.log('Starting migration...');
  
  // Add phone column
  try {
    await pool.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
    console.log('✓ Added phone column');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('- phone column already exists');
    } else {
      console.error('Error adding phone:', e.message);
    }
  }

  // Add bio column
  try {
    await pool.execute('ALTER TABLE users ADD COLUMN bio TEXT');
    console.log('✓ Added bio column');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('- bio column already exists');
    } else {
      console.error('Error adding bio:', e.message);
    }
  }

  // Add notification_preferences column
  try {
    await pool.execute('ALTER TABLE users ADD COLUMN notification_preferences JSON');
    console.log('✓ Added notification_preferences column');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('- notification_preferences column already exists');
    } else {
      console.error('Error adding notification_preferences:', e.message);
    }
  }

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate();
