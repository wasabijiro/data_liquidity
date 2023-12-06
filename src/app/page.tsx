"use client";

import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-3">
      <p className={"text-center text-black text-2xl mb-8 "}>あと払い利用枠</p>
      <div className="flex flex-row">
        <p className={"text-center text-black text-2xl mb-8 "}>¥10,000</p>
        <p className={"text-center text-xl text-blue-500 mb-8"}>/¥10,000</p>
      </div>
      <div className="w-64 h-8 bg-blue-500 rounded-full"></div>
      <button
        className="border-2 border-red-500 bg-white text-red-500 rounded-lg px-8 py-2"
        onClick={() => router.push("/login")}
      >
        データを開示して与信を更新
      </button>
    </div>
  );
};

export default Page;
