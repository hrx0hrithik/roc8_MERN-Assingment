 "use client"

import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const sendOtp = api.user.sendOtp.useMutation()

  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();


  useEffect(() => {
    const storedData = localStorage.getItem('signupData');
    if (storedData) {
      const { name, email, password } = JSON.parse(storedData);
      setName(name);
      setEmail(email);
      setPassword(password);
      router.push('login')
      localStorage.removeItem('signupData'); // Clear data after retrieving
    } else {
      router.push('/'); // Redirect if no data
    }
  }, [router]);

  async function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await sendOtp.mutateAsync({ name, email, password });
      router.push(`/verification?email=${encodeURIComponent(email)}`); 
    } catch (error) {
      console.error('Failed to send OTP', error);
    }
  }

  return (
        <main className=" mx-auto pt-10 mb-6">
          <div className=" border flex flex-col rounded-[20px] w-[576px] h-[620px] p-10">
            <div className=" text-center text-[32px] font-semibold">Create your account</div>
            <div className=" my-8">
              <form className="flex flex-col" onSubmit={onFormSubmit}>
                <div className="mb-8 flex flex-col">
                <label htmlFor="name">Name</label>
                <input className="border p-4 rounded-md" name="name" type="text" placeholder="Enter Name" onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}/>
                </div>
                <div className="mb-8 flex flex-col">
                <label htmlFor="email">Email</label>
                <input className="border p-4 rounded-md" name="email" type="text" placeholder="Enter Email" onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/>
                </div>
                <div className="mb-8 flex flex-col">
                <label htmlFor="password">Password</label>
                <input className="border p-4 rounded-md" name="password" type="password" placeholder="Enter Password" onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="bg-black text-white rounded-md py-[18px] w-full">CREATE ACCOUNT</button>
              </form>
            </div>
            <div className="text-center">Have an Account? <Link href={"/login"} className="font-medium">LOGIN</Link></div>
          </div>
        </main>
  );
}
