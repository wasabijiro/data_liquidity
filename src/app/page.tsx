"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoQuestion } from "react-icons/go";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { useEffect, useState } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { moveCallSponsoredMint } from "@/libs/sponsoredZkLogin";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { SUI_NETWORK } from "@/config/sui";
import { shortenAddress } from "@/utils";

const Page = () => {
  const router = useRouter();

  const credentialSetup = useCredentialDB();
  const zkLoginSetup = useZkLoginSetup();
  const [digest, setDigest] = useState<string>("");
  // const a = true;

  useEffect(() => {
    if (credentialSetup.isVerified) {
    }
  }, []);

  const sendTestTx = async () => {
    const txb = new TransactionBlock();
    const account = zkLoginSetup.account();
    console.log("account", account);
    console.log(zkLoginSetup.userAddr);
    const result = await moveCallSponsoredMint(txb, account);
    console.log(result.effects?.status.status);
    if (result.effects?.status.status === "success") {
      setDigest(result.digest);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-3 p-4 sm:p-0">
      <p className="text-left text-2xl text-black mr-80 sm:ml-0">メルペイ</p>
      <div className="border-2 m-4 p-4 w-full">
        <div className="flex flex-row gap-1">
          <p className="text-center text-xs text-gray-400">
            メルペイあと払い残枠
          </p>
          <div className="text-gray-400">
            <GoQuestion />
          </div>
          <div className="ml-auto">
            <button
              className="border-2 border-red-400 bg-white text-red-400 text-sm rounded-2xl px-10 sm:px-8 py-1 sm:py-1.5 mt-2 sm:mt-4"
              onClick={() => {}}
            >
              支払い方法を変更
            </button>
          </div>
        </div>
        <div className="flex flex-row">
          <p className="text-center text-black text-2xl mb-4 sm:mb-8">
            <b>¥10,000</b>
          </p>
        </div>
        <div className="w-120 h-8 bg-cyan-300 rounded-lg mb-6 sm:mb-10 flex justify-between items-center px-2">
          <div className="text-white font-light">¥0</div>
          <div className="text-white font-light">¥10,000</div>
        </div>
        {credentialSetup.isVerified ? (
          <div className="flex flex-col">
            <button
              className="border-2 border-red-400 bg-white text-red-400 rounded-lg px-10 py-1 sm:py-2 mt-2 sm:mt-4  hover:bg-red-500 hover:text-white"
              onClick={sendTestTx}
            >
              NFTをミント
            </button>
            {digest && (
              <p>
                <a
                  style={{ color: "#0000EE" }}
                  className="mx-1 underline decoration-solid"
                  // href={`https://suiscan.xyz/${NETWORK}/tx/${mintDigest}`}
                  href={`https://suiexplorer.com/txblock/${digest}?network=${SUI_NETWORK}`}
                >
                  {shortenAddress(digest)}
                </a>
              </p>
            )}
          </div>
        ) : (
          <button
            className="border-2 border-red-400 bg-white text-red-400 rounded-lg px-10 py-1 sm:py-2 mt-2 sm:mt-4  hover:bg-red-500 hover:text-white"
            onClick={() => router.push("/login")}
          >
            データを開示して与信を更新
          </button>
        )}
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
          <p className="text-center sm:text-left text-gray-400">
            設定後の使い方・よくある使い
          </p>
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
