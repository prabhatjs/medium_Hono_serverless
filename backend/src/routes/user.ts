import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { env } from 'hono/adapter'
export const userRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string
      }
}>();




  userRouter.post('/signup', async(c) => {

    const prisma=new PrismaClient({
     datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
   //body in hono
    const body=await c.req.json();
   
     //check user is exist or not
     const checkuser=await prisma.user.findUnique({
       where:{
         email:body.email,
       }
     })
     if(checkuser){
       return c.text("email already exists");
     }
   
    const user=await prisma.user.create({
     //@ts-ignore
     data:{
       email:body.email,
       name:body.name,
       password:body.password,
     }
    })
    const token=await sign({id:user.id},"secratecode")
   return c.json({
     jwt:token
   });
   });
   
   userRouter.post('/signin', async(c)=>{
    const prisma=new PrismaClient({
     datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());
   try{
    const body=await c.req.json();
    const user=await prisma.user.findUnique({
     where:{
       email:body.email,
       password:body.password
     }
    });
    if(!user){
     c.status(403);
     return c.json({error:"Invalid "});
    }
    const jwt=await sign({id:user.id},"secratecode")
     return c.json({jwt});
   }
   catch(e){
   console.log(e);
   c.status(411);
   return c.text('Inavalid');
   }
   })