import express from 'express'
import { getThumbnailById, getUserThumbnails } from '../controllers/user.controllers'

const userRouter=express.Router()

userRouter.get('/thumbnails',getUserThumbnails)
userRouter.get('/thumbnail/:id',getThumbnailById)


export default userRouter
