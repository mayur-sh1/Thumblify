import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db";
import session from  "express-session"
import MongoStore from "connect-mongo"
import authRouter from "./routes/auth.routes";
import thumbnailRouter from "./routes/thumbnail.routes";
import userRouter from "./routes/user.routes";


declare module'express-session'{
    interface SessionData{
        isLoggedIn:boolean,
        userId:string,
    }
}

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials:true
}))
app.use(session({
    secret:process.env.SESSION_SECRET as string,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:7*24*60*60*1000},// 7 days
    store:MongoStore.create({
        mongoUrl:process.env.MONGO_DB_URL as string,
        collectionName:'session'
    })
}))
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/auth',authRouter)
app.use('/api/thumbnail',thumbnailRouter)
app.use('/api/user',userRouter)


connectDB().then(()=>{
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch((error)=>{
    console.error("Failed to connect to DB:",error)
    process.exit(1)
})
