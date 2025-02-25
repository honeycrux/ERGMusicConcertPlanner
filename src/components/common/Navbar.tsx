// Used code from: https://dev.to/andrewespejo/how-to-design-a-simple-and-beautiful-navbar-using-nextjs-and-tailwindcss-26p1

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/performance": "Edit Performance",
  "/rundown": "Edit Rundown",
};

export const Navbar = () => {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
  };

  const pathname = usePathname();
  let pageName: string;
  if (routeTitles[pathname]) {
    pageName = routeTitles[pathname];
  } else {
    pageName = "Page Title";
  }

  return (
    <>
      <nav className="flex items-center flex-wrap bg-stone-200 px-4 py-2 shadow-sm shadow-sky-600 border-b-2 border-sky-600">
        <div className="flex items-center flex-shrink-0 text-black mr-6">
          <Link href="/">
            <div className="flex items-center p-1 mr-4 ">
              <Image src="/images/logo.png" alt="Logo" width={130} height={200} className="relative" priority={true} />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-black">{pageName}</h1>
        </div>
        <button className=" inline-flex p-3 hover:bg-stone-300 rounded lg:hidden text-black ml-auto hover:text-black outline-none" onClick={handleClick}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/*Note that in this div we will use a ternary operator to decide whether or not to display the content of the div  */}
        <div className={`${active ? "" : "hidden"}   w-full lg:inline-flex lg:flex-grow lg:w-auto`}>
          <div className="lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto">
            <Link href="/">
              <div className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-black font-bold items-center justify-center hover:bg-stone-300 hover:text-black ">
                Home
              </div>
            </Link>
            <Link href="/performance">
              <div className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-black font-bold items-center justify-center hover:bg-stone-300 hover:text-black ">
                Edit Performance
              </div>
            </Link>
            <Link href="/rundown">
              <div className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-black font-bold items-center justify-center hover:bg-stone-300 hover:text-black">
                Edit Rundown
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};
