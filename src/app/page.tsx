"use client";

import { lalezar } from "@/app/fonts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoQuestion } from "react-icons/go";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { useEffect, useState } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { moveCallSponsoredMint } from "@/libs/sponsoredZkLogin";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { SUI_NETWORK } from "@/config/sui";
import { shortenAddress, fewShortenAddress } from "@/utils";

const Page = () => {
  const router = useRouter();

  const credentialSetup = useCredentialDB();
  const zkLoginSetup = useZkLoginSetup();
  const [digest, setDigest] = useState<string>("");
  const [messsage, setMessage] = useState<string>("");
  const [fetched, setFetched] = useState<boolean>(false);
  const [loading, setLoading] = useState<"not yet" | "loading" | "done">(
    "not yet"
  );
  const [mintLoading, setMintLoading] = useState<
    "not yet" | "loading" | "done"
  >("not yet");
  // const a = true;

  const loadingName = () => {
    if (loading === "not yet") {
      return "";
    } else if (loading === "loading") {
      return "与信額を更新中...";
    } else {
      return "Uniswap v3への多額の流動性供給を評価しました";
    }
  };

  const mintButtonName = () => {
    if (mintLoading === "not yet") {
      return "報酬を受け取る";
    } else if (mintLoading === "loading") {
      return "NFTをミント中...";
    } else {
      return "完了！";
    }
  };

  useEffect(() => {
    console.log("##1##");
    if (credentialSetup.isVerified) {
      setLoading("loading");
      const postData = {
        id: "0x438D35f5420E58A63875B17AF872782be3878bd3",
        balance: 10000,
        loan_amount: 100000,
        liquidation: 100000,
        deferrals: 10000,
        transaction_volume: 10000,
        credit: 100000,
        protocols: { "1": "aave", "2": "uniswapv3_lp", "3": "maker_dao" },
      };

      console.log("##2##");

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify(postData),
      };

      console.log({ requestOptions });

      // if (credentialSetup.isVerified) {
      // Make the POST request only if credential is verified
      fetch("http://localhost:5003/mercari", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          // Handle the response data if needed
          setLoading("done");
          console.log("Response from server:", data);
          setFetched(true);
        })
        .catch((error) => {
          // Handle errors
          console.error("Error making POST request:", error);
        });
    }
    // }
  }, []);

  const sendTestTx = async () => {
    setMintLoading("loading");
    const txb = new TransactionBlock();
    const account = zkLoginSetup.account();
    console.log("account", account);
    console.log(zkLoginSetup.userAddr);
    const result = await moveCallSponsoredMint(txb, account);
    console.log(result.effects?.status.status);
    if (result.effects?.status.status === "success") {
      setMintLoading("done");
      setDigest(result.digest);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-3 p-4 sm:p-0">
      <div className="flex flex-row w-full">
        <p className="text-2xl text-black mr-80">メルペイ</p>
      </div>
      <div className="border-2 m-4 p-4 w-full rounded-lg">
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
          {loading === "done" ? (
            <div className="flex flex-row items-end gap-2">
              <p className="text-center text-black text-2xl mb-4 sm:mb-8">
                <b>¥13,000</b>
              </p>
              <p className="text-center text-cyan-300 text-xl sm:mb-8 mb-4">
                <b>(+30%)</b>
              </p>
            </div>
          ) : (
            <p className="text-center text-black text-2xl mb-4 sm:mb-8">
              <b>¥10,000</b>
            </p>
          )}
        </div>
        <div className="w-120 h-8 bg-cyan-300 rounded-lg mb-4 sm:mb-10 flex justify-between items-center px-2">
          <div className="text-white font-light">¥0</div>
          {loading === "done" ? (
            <div className="text-white font-light">¥13,000</div>
          ) : (
            <div className="text-white font-light">¥10,000</div>
          )}
        </div>
        {loading !== "not yet" && (
          <div className="text-black font-light text-sm mb-2">
            {loadingName()}
          </div>
        )}
        <div className="flex justify-center">
          {credentialSetup.isVerified ? (
            <div className="flex flex-col w-full">
              <button
                className="border-2 border-red-400 bg-white text-red-400 rounded-lg px-10 py-1 sm:py-2 mt-2 sm:mt-4  hover:bg-red-500 hover:text-white mb-2"
                onClick={sendTestTx}
              >
                {mintButtonName()}
              </button>
              {digest && (
                <p>
                  <a
                    style={{ color: "#0000EE" }}
                    className="text-center text-blue-400 underline text-ms mb-8 "
                    // href={`https://suiscan.xyz/${NETWORK}/tx/${mintDigest}`}
                    href={`https://suiexplorer.com/txblock/${digest}?network=${SUI_NETWORK}`}
                  >
                    {fewShortenAddress(digest)}
                  </a>
                </p>
              )}
            </div>
          ) : (
            <button
              className="border-2 w-full border-red-400 bg-white text-red-400 rounded-lg px-10 py-1 sm:py-2 mt-2 sm:mt-4  hover:bg-red-500 hover:text-white"
              onClick={() => router.push("/login")}
            >
              データを開示して与信を更新
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-between items-center w-full border-2 p-3 rounded-lg px-8">
        <div className="m-2 p-3 border-2 rounded-lg">
          <Image src="/qr-code.png" alt="qr-code logo" width={60} height={60} />
          <p className="text-center sm:text-left text-xs mt-1">カード払い</p>
        </div>
        <div className="m-2 p-3 border-2 rounded-lg">
          <Image src="/yen.png" alt="yen logo" width={60} height={60} />
          <p className="text-center sm:text-left text-xsx mt-1">残高</p>
        </div>
        <div className="m-2 p-3 border-2 rounded-lg">
          <Image src="/point.png" alt="point logo" width={60} height={60} />
          <p className="text-center sm:text-left text-xs mt-1">ポイント</p>
        </div>
        <div className="m-2 p-3 border-2 rounded-lg">
          <Image
            src="/calender.png"
            alt="calender logo"
            width={60}
            height={60}
            className="mx-auto"
          />
          <p className="text-center sm:text-left text-xs mt-1">あと払い履歴</p>
        </div>
      </div>
      <div className="flex border-2 w-full p-4 rounded-lg">
        <div className="flex flex-row">
          <div className="mr-20 pr-20">
            <p className="text-center sm:text-left">電子マネー(iD)</p>
            <p className="text-center sm:text-left text-gray-400 text-xs">
              設定後の使い方・よくある使い方
            </p>
          </div>
          <div className="pl-4 mt-1 ">
            <Image src="/id.png" alt="id logo" width={75} height={75} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
