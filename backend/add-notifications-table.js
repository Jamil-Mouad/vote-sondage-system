const { pool } = require('./src/config/database');

async function migrate() {
    console.log('Starting notifications table migration...');

    try {
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('✓ Created notifications table');
    } catch (e) {
        console.error('Error creating notifications table:', e.message);
    }

    console.log('\nMigration complete!');
    process.exit(0);
}

migrate();
