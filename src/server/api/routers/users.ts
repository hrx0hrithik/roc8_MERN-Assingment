/* eslint-disable */
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "@/app/api/sendMail";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "your_secret_key";
const pendingSignups = new Map();

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(6),
        categories: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password, categories } = input;

      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userCategories: any[] = categories.map((categoryId) => ({
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
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return { success: false, message: "Invalid credentials" };
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      return { success: true, token };
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const storedData = pendingSignups.get(input.email);

      if (!storedData) {
        return { verified: false, message: "Email not found" };
      }

      if (storedData.otp === input.otp) {
        // OTP is correct
        pendingSignups.delete(input.email);
        return {
          verified: true,
          message: "OTP verified successfully",
          user: {
            name: storedData.name,
            password: storedData.password, 
          },
        };
      } else {
        return { verified: false, message: "Invalid OTP" };
      }
    }),

  sendOtp: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const otp = Math.floor(10000000 + Math.random() * 90000000).toString();

      pendingSignups.set(input.email, {
        name: input.name,
        password: input.password,
        otp,
      });

      // Send the OTP email
      await sendOtpEmail(input.name, input.email, otp);

      return { message: "OTP sent successfully" };
    }),

  getUserData: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user?.userId },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user;
  }),

  saveUserCategories: privateProcedure
  .input(z.array(z.number()))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.userId;

    await ctx.db.userCategory.deleteMany({
      where: { userId },
    });

    if (input.length > 0) {
      await ctx.db.userCategory.createMany({
        data: input.map((categoryId) => ({
          userId,
          categoryId,
        })),
      });
    }

    return { success: true };
  }),



  getUserCategories: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.userId;
    if (!userId) {
      console.error("UNAUTHORIZED");
    }

    const userCategories = await ctx.db.userCategory.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
    });

    return userCategories.map((uc) => ({
      userId: uc.userId,
      categoryId: uc.categoryId,
      category: {
        id: uc.category.id,
        name: uc.category.name,
      },
    }));
  }),

  getCategories: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categoriesPerPage = 6;
      const categories = await ctx.db.category.findMany({
        skip: (input.page - 1) * categoriesPerPage,
        take: categoriesPerPage,
      });
      return categories;
    }),
});
