// src/index.js
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { connectDB } from './db.js'

const app = new Hono()

app.get('/', (c) => 
  c.text('Welcome to the Library API!')
)

//users
app.get('/users', async (c) => {
  const db = await connectDB()
  const result = await db.request().query('SELECT * FROM Users')
  return c.json(result.recordset)
})

app.post('/users', async (c) => {
  const db = await connectDB()
  const { name, email } = await c.req.json()
  await db.request()
    .input('name', name)
    .input('email', email)
    .query('INSERT INTO Users (name, email) VALUES (@name, @email)')
  return c.text('User added successfully')
})

//books
app.get('/books', async (c) => {
  const db = await connectDB()
  const result = await db.request().query(`
    SELECT b.*, u.name AS user_name 
    FROM Books b LEFT JOIN Users u ON b.user_id = u.user_id
  `)
  return c.json(result.recordset)
})
//get books by id
app.get('/books/:id', async (c) => {
  const db = await connectDB()
  const id = c.req.param('id')
  const result = await db.request().input('id', id).query('SELECT * FROM Books WHERE book_id = @id')
  return result.recordset.length ? c.json(result.recordset[0]) : c.text('Book not found', 404)
})

app.post('/books', async (c) => {
  const db = await connectDB()
  const { title, author, genre, year, user_id } = await c.req.json()
  await db.request()
    .input('title', title)
    .input('author', author)
    .input('genre', genre)
    .input('year', year)
    .input('user_id', user_id)
    .query('INSERT INTO Books (title, author, genre, year, user_id) VALUES (@title, @author, @genre, @year, @user_id)')
  return c.text('Book added successfully')
})
//update books
app.put('/books/:id', async (c) => {
  const db = await connectDB()
  const id = c.req.param('id')
  const { title, author, genre, year, user_id } = await c.req.json()
  await db.request()
    .input('id', id)
    .input('title', title)
    .input('author', author)
    .input('genre', genre)
    .input('year', year)
    .input('user_id', user_id)
    .query('UPDATE Books SET title=@title, author=@author, genre=@genre, year=@year, user_id=@user_id WHERE book_id=@id')
  return c.text('Book updated successfully')
})
//dlete books
app.delete('/books/:id', async (c) => {
  const db = await connectDB()
  const id = c.req.param('id')
  await db.request().input('id', id).query('DELETE FROM Books WHERE book_id=@id')
  return c.text('Book deleted successfully')
})

// Start the server
serve({
  fetch: app.fetch,
  port: 3000,
})
console.log('Server running on http://localhost:3000')

