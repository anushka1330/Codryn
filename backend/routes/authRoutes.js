'use strict'

const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const router  = express.Router()
const User    = require('../models/User')

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'codryn_dev_secret',
    { expiresIn: '7d' }
  )
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    const exists = await User.emailExists(email)
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password_hash })
    const token = signToken(user)

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    const token = signToken(user)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    next(err)
  }
})

module.exports = router
