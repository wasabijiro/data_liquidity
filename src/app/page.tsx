"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";


const Page = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-3 p-4 sm:p-0">
      <div className="border-2 m-4 p-4">
        <div className="flex flex-row">
          <p className="text-center text-gray-400">メルペイあと払い残枠</p>
          <button
            className="border-2 border-red-500 bg-white text-red-500 rounded-lg px-6 sm:px-10 py-1 sm:py-2 mt-2 sm:mt-4 ml-2 sm:ml-4"
            onClick={() => router.push("/login")}
          >
            支払い方法を変更
          </button>
        </div>
        <div className="flex flex-row">
          <p className="text-center text-black text-2xl mb-4 sm:mb-8">¥10,000</p>
        </div>
        <div className="w-52 h-6 bg-blue-500 rounded-full mb-6 sm:mb-10"></div>
        <button
          className="border-2 border-red-500 bg-white text-red-500 rounded-lg px-10 py-1 sm:py-2 mt-2 sm:mt-4"
          onClick={() => router.push("/login")}
        >
          データを更新して与信を更新
        </button>
      </div>
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-2 p-2 m-2"> */}
      <div className="flex flex-row border-2 p-2 m-2">
        <div className="border-2 border-gray-500 bg-white text-gray-500 rounded-lg px-2 py-2">
          コード払い
          <Image
            className="px-1 py-1 ml-1"
            src="/qr-code.png"
            alt="qr-code logo"
            width={30}
            height={30}
          />
        </div>
        <div className="border-2 border-gray-500 bg-white text-gray-500 rounded-lg px-2 py-2">
          残高
          <Image
            className="px-1 py-1 ml-1"
            src="/yen.png"
            alt="yen logo"
            width={30}
            height={30}
          />
        </div>
        <div className="border-2 border-gray-500 bg-white text-gray-500 rounded-lg px-2 py-2">
          ポイント
          <Image
            className="px-1 py-1 ml-1"
            src="/point.png"
            alt="point logo"
            width={30}
            height={30}
          />
        </div>
        <div className="border-2 border-gray-500 bg-white text-gray-500 rounded-lg px-2 py-2">
          あと払い履歴
          <Image
            className="px-1 py-1 ml-1"
            src="/calender.png"
            alt="calender logo"
            width={40}
            height={40}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 border-2 p-2">
        <div className="mb-4 sm:mb-0">
          <p className="text-center sm:text-left">電子マネー(iD)</p>
          <br />
          <p className="text-center sm:text-left text-gray-400">設定後の使い方・よくある使い</p>
        </div>
        <div className="flex items-center justify-center sm:justify-end">
          <Image
            className=""
            src="/id.png"
            alt="id logo"
            width={75}
            height={75}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
