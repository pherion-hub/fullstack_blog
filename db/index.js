import pg from 'pg'
const { Pool } = pg
 
const pool = new Pool({connectionString: process.env.PG_URI, 
})
 
export const query = (text, params, callback) => {
  return pool.query(text, params, callback)
}