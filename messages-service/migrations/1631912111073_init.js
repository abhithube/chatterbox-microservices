exports.up = async (pgm) => {
  await pgm.db.query(
    `
    CREATE TABLE parties (
      id VARCHAR(255) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      invite_token VARCHAR(255) NOT NULL
    );

    CREATE TABLE topics (
      id VARCHAR(255) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      party_id VARCHAR(255) NOT NULL REFERENCES parties ON DELETE CASCADE
    );

    CREATE TABLE users (
      id VARCHAR(255) NOT NULL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      avatar_url VARCHAR(255)
    );

    CREATE TABLE members (
      user_id VARCHAR(255) NOT NULL REFERENCES users ON DELETE CASCADE,
      party_id VARCHAR(255) NOT NULL REFERENCES parties ON DELETE CASCADE
    )
    `
  );
};

exports.down = async (pgm) => {
  await pgm.db.query(
    `
    DROP TABLE parties CASCADE;
    DROP TABLE topics CASCADE;
    DROP TABLE users CASCADE;
    DROP TABLE members CASCADE;
    `
  );
};
