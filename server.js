import express from "express"
import { query } from "./db/index.js"
import cors from "cors"

const posts = [
    { id: 1, title: 'Das ist der erste Post'},
    { id: 2, title: 'Das ist der zweite Post'},
    { id: 3, title: 'Das ist der dritte Post'}
]


const app = express()
const port = 7755

app.use(cors())

app.use(express.json())

// app.get('/', async (req, res) => {
//     const { rows } = await query("SELECT NOW();")

//     // console.log(rows)

//     const data = {
//         message: "Hello from Express!"
//     }
//     res.json(rows)
// })

// app.post('/', (req, res) => {
//     res.status(201).json({ message: 'Posting to Express'})
// })


app.get("/posts", async(req, res) => {
try {
   const { rows } = await query("SELECT * FROM posts;")
    res.json(rows) 
} catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error"})
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
         res.status(500).json({ message: "Server error"})
     }
})

app.post("/posts", async (req, res) => {
    const { title, author, content, cover, date } = req.body

    if (!title) return res.status(400).json({ message: "Title is required"})

    try {
        const { rows, rowCount } = await query("INSERT INTO posts (title, author, content, cover, date) values ($1, $2, $3, $4, $5) RETURNING *;", [title, author, content, cover, date])

        console.log({ rows, rowCount })
        res.status(201).json({ message: "Post created", data: rows[0] })
     } catch (error) {
         console.error(error)
         res.status(500).json({ message: "Server error"})
     }
})

app.put("/posts/:id", async (req, res) => {
    const { id } = req.params
    const { title } = req.body

    try {
        const { rows, rowCount } = await query(`UPDATE posts SET title = COALESCE($1, title) WHERE id = $2 RETURNING *; `, [title, id])

        // console.log({ rows, rowCount })
        if (rowCount === 0) {
            return res.status(404).json({ message: "Post not found"})
        }

        res.status(200).json({ message: 'Post successfully updated.', data: rows[0] })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error"})
    }

})

app.delete("/posts/:id", async (req, res) => {
    const { id } = req.params
    try {
        const { rows, rowCount } = await query("DELETE FROM posts WHERE id = $1 RETURNING *;", [id])
         if (rowCount === 0) {
             return res.status(404).json({ message: "Post not found"})
         }

         res.json({message: "Post deleted", data: rows[0]})
     } catch (error) {
         console.error(error)
         res.status(500).json({ message: "Server error"})
     }
})



app.listen(port, () => console.log(`Express Server listening on port ${port}`))