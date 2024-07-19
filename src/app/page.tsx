import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
        <main className=" mx-auto pt-10 mb-6">
          <div className=" border flex flex-col rounded-[20px] w-[576px] h-[620px] p-10">
            <div className=" text-center text-[32px] font-semibold">Create your account</div>
            <div className=" my-8">
              <form action="" className="flex flex-col">
                <div className="mb-8 flex flex-col">
                <label htmlFor="name">Name</label>
                <input className="border p-4 rounded-md" name="name" type="text" placeholder="Enter Name" />
                </div>
                <div className="mb-8 flex flex-col">
                <label htmlFor="email">Email</label>
                <input className="border p-4 rounded-md" name="email" type="text" placeholder="Enter Email"/>
                </div>
                <div className="mb-8 flex flex-col">
                <label htmlFor="password">Password</label>
                <input className="border p-4 rounded-md" name="password" type="password" placeholder="Enter Password" />
                </div>
                <button className="bg-black text-white rounded-md py-[18px] w-full">CREATE ACCOUNT</button>
              </form>
            </div>
            <div className="text-center">Have an Account? <Link href={"/login"} className="font-medium">LOGIN</Link></div>
          </div>
        </main>
    </HydrateClient>
  );
}
