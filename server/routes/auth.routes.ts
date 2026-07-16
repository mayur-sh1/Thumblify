import express from 'express'
import { loginUser, logoutUser, registerUser, verifyUser } from '../controllers/auth.controllers'
import protect from '../middlewares/auth'

const authRouter=express.Router()

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.get('/verify',protect,verifyUser)
authRouter.post('/logout',protect,logoutUser)

export default authRouter 
