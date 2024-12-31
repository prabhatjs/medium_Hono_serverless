import z from 'zod'

export  const signinInput=z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

export const signupInput=z.object({
    email:z.string().email(),
    password:z.string().min(8),
    name:z.string().min(3)
})