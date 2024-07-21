"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const loginUser = api.user.login.useMutation();
  const getUserData = api.user.getUserData.useQuery(undefined, {
    enabled: false,
  });

  async function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await loginUser.mutateAsync({ email, password });

      if (response.success) {
        console.log(response.success, response.message);
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log(response.token, response.success);

          const userDataResponse = await getUserData.refetch();
          if (userDataResponse.isSuccess) {
            console.log('User data:', userDataResponse.data);
            router.push('/user');
          } else {
            console.error('Failed to fetch user data:', userDataResponse.error);
          }
        } else {
          console.error('Login successful, but no token received.');
        }
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
    }
  }

    return(
        <main className=" mx-auto pt-10 mb-6">
          <div className=" border flex flex-col rounded-[20px] w-[576px] h-[614px] p-10">
            <div className=" text-center text-[32px] font-semibold mb-4">Login</div>
            <div className="text-center font-medium text-2xl">Welcome back to ECOMMERCE</div>
            <div className="text-center font-normal text-base mt-1">The next gen business marketplace</div>
            <div className=" my-6">
              <form className="flex flex-col" onSubmit={onFormSubmit}>
                <div className="mb-8 flex flex-col">
                <label htmlFor="email">Email</label>
                <input className="border p-4 rounded-md" name="email" type="text" placeholder="Enter Email" onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/>
                </div>
                <div className="mb-8 flex flex-col">
                <label htmlFor="password">Password</label>
                <input className="border p-4 rounded-md" name="password" type="password" placeholder="Enter Password" onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="bg-black text-white rounded-md py-[18px] w-full">LOGIN</button>
              </form>
            </div>
            <div className="text-center">Don’t have an Account?  <Link href={"/"} className="font-medium">SIGN UP</Link></div>
          </div>
        </main>
    )
}