exports.up = async (pgm) => {
  await pgm.db.query(
    `
    CREATE TABLE messages (
      id VARCHAR(255) NOT NULL PRIMARY KEY,
      topic_index INT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_id VARCHAR(255) NOT NULL REFERENCES users ON DELETE CASCADE,
      topic_id VARCHAR(255) NOT NULL REFERENCES topics ON DELETE CASCADE
    )
    `
  );
};

exports.down = async (pgm) => {
  await pgm.db.query('DROP TABLE messages CASCADE');
};
