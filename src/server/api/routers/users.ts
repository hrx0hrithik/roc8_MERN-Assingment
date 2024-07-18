import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const userRouter = createTRPCRouter({
  signup: publicProcedure
  .input(z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(6),
    categories: z.array(z.number())
  }))
  .mutation(async ({ ctx, input }) => {
    const { name, email, password, categories } = input;
    
    const existingUser = await ctx.db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCategories: any[] = categories.map(categoryId => ({
      id: categoryId,
    }));    

    return ctx.db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        selectedCategories: {
          connect: userCategories,
        },
      },
    });
  }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      return { token };
    })

});

  // .middleware(async ({ ctx, next }) => {
  //   const { authorization } = ctx.req.headers;

  //   if (!authorization) {
  //     throw new Error('Unauthorized');
  //   }

  //   try {
  //     const token = authorization.split(' ')[1];
  //     const payload = jwt.verify(token, JWT_SECRET);
  //     ctx.userId = payload.userId;
  //     return next();
  //   } catch (error) {
  //     throw new Error('Unauthorized');
  //   }
  // })
  // .query('categories', {
  //   input: z.object({
  //     page: z.number().default(1),
  //     limit: z.number().default(6),
  //   }),
  //   async resolve({ input, ctx }) {
  //     const { page, limit } = input;

  //     const categories = await prisma.category.findMany({
  //       skip: (page - 1) * limit,
  //       take: limit,
  //     });

  //     const totalCategories = await prisma.category.count();
  //     const user = await prisma.user.findUnique({
  //       where: { id: ctx.userId },
  //       include: { selectedCategories: true },
  //     });

  //     return {
  //       categories,
  //       totalPages: Math.ceil(totalCategories / limit),
  //       selectedCategories: user?.selectedCategories.map(category => category.id) || [],
  //     };
  //   },
  // })
  // .mutation('selectCategories', {
  //   input: z.array(z.number()),
  //   async resolve({ input, ctx }) {
  //     const user = await prisma.user.update({
  //       where: { id: ctx.userId },
  //       data: {
  //         selectedCategories: {
  //           set: input.map(categoryId => ({ id: categoryId })),
  //         },
  //       },
  //     });

  //     return user.selectedCategories;
  //   },
  // });
