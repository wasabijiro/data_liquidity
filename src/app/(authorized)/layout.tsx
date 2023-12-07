"use client";

import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { FooterMenu } from "@/components/FooterMenu";
import { moveCallSponsoredMint } from "@/libs/sponsoredZkLogin";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { useLocalStorage } from "usehooks-ts";
import { ZKLOGIN_ACCONTS } from "@/config";
import type { Account } from "@/types";

export default function AuthorizedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const zkLoginSetup = useZkLoginSetup();

  const [account, setAccount] = useLocalStorage<Account | null>(
    ZKLOGIN_ACCONTS,
    null
  );

  useEffect(() => {
    if (account) {
      zkLoginSetup.completeZkLogin(account);
      // console.log(zkLoginSetup.account());
      // setAccount(zkLoginSetup.account());
    }
  }, []);

  const logout = async () => {
    setAccount(null);
    zkLoginSetup.initZkLogin();
    router.push("/login");
  };

  const status = () => {
    if (!zkLoginSetup.userAddr) {
      return "Generating user address...";
    }

    if (!zkLoginSetup.zkProofs && zkLoginSetup.isProofsLoading) {
      return "Generating zk proof...";
    }

    return "Send sponsored tx with zk login";
  };

  const sendTestTx = async () => {
    const txb = new TransactionBlock();
    const account = zkLoginSetup.account();
    console.log("account", account);
    console.log(zkLoginSetup.userAddr);
    const result = await moveCallSponsoredMint(txb, account);
    console.log(result.effects?.status.status);
  };

  return (
    <>
      {children}

      <div className="absolute bottom-0 left-0 w-full">
        <FooterMenu />
      </div>

      {/* <div className="fixed top-0 right-0 p-4 flex flex-col gap-4">
        <button
          onClick={sendTestTx}
          className={`flex items-center justify-center text-white py-3 px-5 rounded-xl w-80 ${
            !zkLoginSetup.zkProofs
              ? "bg-gray-500"
              : "bg-blue-600 hover:bg-slate-700"
          }`}
        >
          {!zkLoginSetup.zkProofs && (
            <div className="animate-spin h-5 w-5 mr-3 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          {status()}
        </button>

        <button
          className={`text-white py-3 px-5 rounded-xl w-80 ${
            !zkLoginSetup.zkProofs
              ? "bg-gray-500"
              : "bg-blue-600 hover:bg-slate-700"
          }`}
          onClick={logout}
        >
          Log out
        </button>
      </div> */}
    </>
  );
}
