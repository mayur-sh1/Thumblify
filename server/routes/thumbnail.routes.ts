import express from 'express'
import { deleteThumbnail, generateThumbnail } from '../controllers/thumbnail.controllers';
import protect from '../middlewares/auth';

const thumbnailRouter=express.Router();

thumbnailRouter.post('/generate',protect,generateThumbnail)
thumbnailRouter.delete('/delete/:id',protect,deleteThumbnail)

export default thumbnailRouter
  