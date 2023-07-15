const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../modules/Blog')

const helper = require('../utils/testHelp')

beforeEach(async () => {
  await Blog.deleteMany({})
  for (let blogg of helper.initialBlogs) {
    let blogObj = new Blog(blogg)
    await blogObj.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs/')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/blogs')
  const title = response.body.map(r => r.title)
  expect(title).toContain(
    'Type wars'
  )
})

test('id match', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('POST works, added one Note', async () => {
  const newBlogObj = {
    _id: '5a422aa71b54a676234d17f9',
    title: 'Tesytest Blog, Coding Love',
    author: 'Lucasio',
    url: 'http://www.google.com',
    likes: 66,
    // __v: 0
  }
  const newBlog = new Blog(newBlogObj)
  await api.post('/api/blogs').send(newBlog)
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
})

test('DELETE works, deleted last blog', async () => {
  await api
    .del('/api/blogs/5a422aa71b54a676234d17f9')
    .expect(204)
})

test('after delete, correct Number of Notes are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('PUT works, updated likes for Lucasio Blog', async () => {
  const newBlogObj = {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 77,
    __v: 0
  }
  await api
    .put('/api/blogs/5a422aa71b54a676234d17f8')
    .set('Content-Type', 'application/json')
    .send(newBlogObj)
  const result = await api.get('/api/blogs/5a422aa71b54a676234d17f8')
  expect(result.statusCode).toBe(200)
  expect(result.body.likes).toBe(77)
})

afterAll(async () => {
  await mongoose.connection.close()
})