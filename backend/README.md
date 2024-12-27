```
npm install
npm run dev
```

```
npm run deploy
```
Number of steps to follow initialize DB (prisma with cloudflare)
1.get your connection url from neon.db or aieven.tech
postgresql://myblogdb_owner:*****************@e-star-tgkbwu.us-east-2.aws.neon.tech/myblogdb?sslmode=require

since we use cloudflare what does cloudflare worker do generally,in world map there are lot of country when ever you deploye cloudflare app it get deployed in mini machine around the world its called serverless ,there are lot of servers ,like 100 of mini machines runing you app this become problematic because this means 100 of machines connect your database yor dont want to direct access of your database(you can not connect directly database ) , you have to connect database through connection pool and connection pool connect you through database
prisma provide connction poool 


2. Get connection pool URL From prisma accelerate
https://www.prisma.io/data-platform/accelerate

DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMzc1lY3JldCI6IjZlMjJkMTMxLWFjYWEtNGNkMS05YmI3LWI2YTJkMGE5YzE5MyJ9.qhktq9DQsxwuWCDkvdw_nhoHZiJgqPDv8j45kUqs4DM"

in prisma accelerate paste your database connection string i am using neon db ..
Database Connection string---
postgresql://myblogdb_owner:*****************@e-star-tgkbwu.us-east-2.aws.neon.tech/myblogdb?sslmode=require

```
using hono 
    with neon db
    prisma client
    hono/jwt
    

    ----------------------------------validation----------------------
    using zod for type shefty
    check user is exist or not is user is exists show mesg
    