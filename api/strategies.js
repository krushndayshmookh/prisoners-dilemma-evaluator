import { sql } from '@vercel/postgres'

export default async (req, res) => {
  if (req.method === 'POST') {
    const { code, email } = req.body

    // validate code and email
    if (!code) {
      return res.status(400).json({ error: 'code is required' })
    }
    if (!email) {
      return res.status(400).json({ error: 'email is required' })
    }

    // validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'invalid email' })
    }

    try {
      // save everything to the database
      const { rows } =
        await sql`INSERT INTO psp_strategies (code, email) VALUES (${code}, ${email}) RETURNING *`

      return res.status(200).json(rows)
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error })
    }
  } else if (req.method === 'GET') {
    // get all strategies by email
    if (req.query.email) {
      const { email } = req.query

      // validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'invalid email' })
      }

      try {
        // get all strategies from the database
        const { rows } =
          await sql`SELECT * FROM psp_strategies WHERE email = ${email}`

        return res.status(200).json(rows)
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error })
      }
    }

    // get strategy by id
    if (req.query.id) {
      const { id } = req.query

      try {
        // get all strategies from the database
        const { rows } =
          await sql`SELECT * FROM psp_strategies WHERE id = ${id}`

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Strategy not found' })
        }

        return res.status(200).json(rows)
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error })
      }
    }

    // get all strategies from the database
    try {
      const { rows } = await sql`SELECT  id, email, submitted_at, last_evaluated_at, last_evaluation_time, win_count, loss_count, evaluated_against_count FROM psp_strategies ORDER BY win_count DESC`

      return res.status(200).json(rows)
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error })
    }
  } else {
    console.error('Error:', error)
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
}
