import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import { auth } from 'hono/utils/basic-auth';


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

blogRouter.delete('/:id', async (c) => {
  const id = c.req.param('id'); // Get the ID from the URL params
  console.log('ID to delete:', id);

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const authorId = c.get("userId");  // Get the user ID from the request context (set in the middleware)
  console.log('Author ID from JWT:', authorId);

  // Check if the blog exists and retrieve the author ID
  const blogCheck = await prisma.post.findUnique({
    where: {
      id: Number(id), // Assuming the 'id' is a string (UUID)
    },
    select: { authorid: true },
  });

  console.log('Blog check result:', blogCheck);

  // If the blog does not exist
  if (!blogCheck) {
    c.status(404);
    return c.json({
      message: 'Blog post not found',
    });
  }

  // If the author of the post is not the logged-in user
  if (blogCheck.authorid !== Number(authorId)) {
    c.status(403);
    return c.json({
      error: 'Unauthorized: You can only delete your own posts',
    });
  }

  try {
    // Proceed with the deletion
    const deletedBlog = await prisma.post.delete({
      where: { id: Number(id) }, // No need to convert id if it's a string (UUID)
    });

    // Return success response
    return c.json({
      message: 'Post Deleted',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    c.status(500);
    return c.json({
      error: 'Error while deleting the post',
    });
  }
});


blogRouter.get('/bulk', async(c) => {
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const blog=await prisma.post.findMany();

  return c.json({ blog });
});
