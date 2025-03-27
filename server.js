import express from "express"
import { query } from "./db/index.js"


const posts = [
    { id: 1, title: 'Das ist der erste Post'},
    { id: 2, title: 'Das ist der zweite Post'},
    { id: 3, title: 'Das ist der dritte Post'}
]


const app = express()
const port = 7755

app.use(express.json())

app.get('/', async (req, res) => {
    const { rows } = await query("SELECT NOW();")

    // console.log(rows)

    const data = {
        message: "Hello from Express!"
    }
    res.json(rows)
})

app.post('/', (req, res) => {
    res.status(201).json({ message: 'Posting to Express'})
})


app.get("/posts", async(req, res) => {
try {
   const { rows } = await query("SELECT * FROM posts;")
    res.json(rows) 
} catch (error) {
    console.error(error)
    res.statusCode(500).json({ message: "Server error"})
}
})

app.get("/posts/:id", async (req, res) => {
    const id = req.params.id
    try {
        const { rows, rowCount } = await query("SELECT * FROM posts WHERE id = $1;", [id])
         if (rowCount === 0) {
             return res.status(404).json({ message: "Post not found"})
         }

         res.json(rows)
     } catch (error) {
         console.error(error)
         res.statusCode(500).json({ message: "Server error"})
     }
})

app.post("/posts", async (req, res) => {
    const { title } = req.body

    if (!title) return res.status(400).json({ message: "Title is required"})

    try {
        const { rows, rowCount } = await query("INSERT INTO posts (title) values ($1) RETURNING *;", [title])

        console.log({ rows, rowCount })
        res.status(201).json({ message: "Post created", data: rows[0] })
     } catch (error) {
         console.error(error)
         res.statusCode(500).json({ message: "Server error"})
     }
})

app.put("/posts/:id", (req, res) => {
    const { id } = req.params
    const body = req.body

    const postInd = posts.findIndex((rec) => rec.id === parseInt(id))

    posts.splice(postInd, 1, { ...body, id })

    res.json({ message: "PUT /posts", data: { ...body, id: +id } })
})

app.delete("/posts/:id", (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const postInd = posts.findIndex((rec) => rec.id === parseInt(id))
    posts.splice(postInd, 1)
    res.json({ message: "DELETE /posts" })
})



app.listen(port, () => console.log(`Express Server listening on port ${port}`))