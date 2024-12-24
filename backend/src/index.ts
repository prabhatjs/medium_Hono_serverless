import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'hono/adapter'
import { sign } from 'hono/jwt'

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string
  }
}>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

//initialize handlers

app.post('/api/v1/signup', async(c) => {

 const prisma=new PrismaClient({
  datasourceUrl:c.env.DATABASE_URL,
 }).$extends(withAccelerate())
//body in hono
 const body=await c.req.json();

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

app.post('/api/v1/signin', async(c)=>{
 const prisma=new PrismaClient({
  datasourceUrl:c.env.DATABASE_URL,
 }).$extends(withAccelerate());

 const body=await c.req.json();
 const user=await prisma.user.findUnique({
  where:{
    email:body.email
  }
 });
 if(!user){
  c.status(403);
  return c.json({error:"user not found"});
 }
 const jwt=await sign({id:user.id},"secratecode")
  return c.json({jwt});
})

app.post('/api/v1/blog',(c)=>{
  return c.text('Hello Hono!')
})
app.put('/api/v1/blog' , (c)=>{
  return c.text('Hello Hono!')
});
app.get('/api/v1/blog/:blogid',(c)=>{
  return c.text('Hello Hono!')
})
export default app
