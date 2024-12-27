import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'hono/adapter'
import { sign, verify } from 'hono/jwt'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string
  }
}>()

//middleware
// app.use('/api/v1/blog/*',async (c,next)=>{
//   //get the header
//   //verify the header,
//   //if header is correct we need can proceed
//   //if not we return the user a 403 status code
//   console.log("verify")
//   const header:string=c.req.header("Authorization")||"";
//   if(!header){
//     c.status(401)
//     return c.json({error:"unauthorized"});
//   }
//   const token:string =header.split(" ")[1];
//   const payload=await verify(header,"secratecode");
//   if(payload.id){
//     next();
//   }else{
//     c.status(403)
//     return c.json({
//       error:"Unauthorized"
//     })
//   }
  
// })
app.route('/api/v1/user',userRouter)
app.route('/api/v1/blog',blogRouter);

export default app
