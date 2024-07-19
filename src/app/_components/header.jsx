import { Navbar } from "@/app/_components/navbar";

export function Header() {

    return(
        <header>
        <Navbar />
        <div className=" w-full bg-[#F4F4F4] h-9 relative flex items-center justify-center">
          <div className=" h-[18px] w-[290px] flex justify-between items-center text-sm font-medium">
            <span className=" font-semibold text-lg cursor-pointer">&#60;</span>
            <span className="cursor-default">Get 10% off on business sign up</span>
            <span className=" font-semibold text-lg cursor-pointer">&#62;</span>
          </div>
        </div>
        </header>
    )
}