import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';


export const blogRouter = new Hono<{
  Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
  }, 
  Variables: {
      userId: string;
  }
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  try {
      const user = await verify(authHeader, "secratecode");
      if (user) {
          c.set("userId", user.id);
          await next();
      } else {
          c.status(403);
          return c.json({
              message: "You are not logged in"
          })
      }
  } catch(e) {
      c.status(403);
      return c.json({
          message: "You are not logged in"
      })
  }
});

blogRouter.post('/', async (c) => {
  const body = await c.req.json();
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
   }).$extends(withAccelerate())
  const authorId = c.get("userId"); // Get the 'userid' from the request context (set in middleware)
  console.log(authorId);
  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        published: body.published,
        authorid: Number(authorId), // Use the authenticated user's ID as the author
      },
    });
    return c.json({ id: blog.id });
  } catch (error) {
    c.status(500)
    return c.json({ message: 'Database error: ' + error });
  }
});

blogRouter.put('/', async (c) => {
  
  const body = await c.req.json();
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
   }).$extends(withAccelerate())
  try {
    const authorId = c.get("userId"); 
    const blogcheck=await prisma.post.findUnique({
      where:{
        id:Number(body.id)
      },
      select:{authorid:true}
    });
    if(!blogcheck){
      c.status(404)
      return c.json({
        message:"Blog post not found"
      })
    }
    if(blogcheck.authorid!==Number(authorId)){
      c.status(403);
      return c.json({ error: 'Unauthorized: You can only update your own posts' });
    }

    const blog = await prisma.post.update({
      where: { id: Number(body.id) },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.text('updated post');
  } catch (error) {
     c.status(500);
     c.json({ message: 'Error updating post: ' + error });
  }
});

blogRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
   }).$extends(withAccelerate())
  if (!id) {
     c.status(400);
    return c.json({ message: 'ID is required' });
  }

  try {
    const blog = await prisma.post.findFirst({ where: { id: Number(id) } });
    if (!blog) {
       c.status(404)
       return c.json({ message: 'Blog post not found' });
    }
    return c.json({ blog });
  } catch (error) {
     c.status(500);
     return c.json({ message: 'Error while fetching blog posts' });
  }
});

blogRouter.get('/bulk', async(c) => {
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const blog=await prisma.post.findMany();

  return c.json({ blog });
});
