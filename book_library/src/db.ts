import sql from 'mssql'

const dbConfig = {
  user: 'sa',
  password: 'YourStrong!Passw0rd',
  server: 'db', // matches docker-compose service name
  database: 'LibraryDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

export const connectDB = async () => {
  try {
    const pool = await sql.connect(dbConfig)

    // Create tables
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `)

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Books' AND xtype='U')
      CREATE TABLE Books (
        book_id INT IDENTITY(1,1) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        year INT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      );
    `)

    console.log('Database Connected!')
    return pool
  } catch (err) {
    console.error('database connection failed:', err)
    throw err
  }
}
