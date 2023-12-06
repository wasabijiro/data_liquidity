"use client";

import Image from "next/image";
import { useLocalStorage } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Account, OpenIdProvider } from "@/types";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { ZKLOGIN_ACCONTS } from "@/config";
import { useLottie } from "@/utils/useLottie";
import { lalezar } from "@/app/fonts";

export default function Page() {
  const router = useRouter();
  const [account, setAccount] = useLocalStorage<Account | null>(
    ZKLOGIN_ACCONTS,
    null
  );
  const zkLoginSetup = useZkLoginSetup();

  useEffect(() => {
    if (account) {
      zkLoginSetup.completeZkLogin(account);
    }
  }, []);

  // https://docs.sui.io/build/zk_login#set-up-oauth-flow
  const beginZkLogin = async (provider: OpenIdProvider) => {
    await zkLoginSetup.beginZkLogin(provider);
    console.log(zkLoginSetup.account());
    setAccount(zkLoginSetup.account());
    console.log(zkLoginSetup.userAddr);
    const loginUrl = zkLoginSetup.loginUrl();
    window.location.replace(loginUrl);
  };

  const openIdProviders: OpenIdProvider[] = [
    "Google",
    // "Twitch",
    // "Facebook",
  ];

  return (
    <div className="grid place-items-center h-screen">
      <div className="pb-32">
        <p
          className={`text-center text-black text-3xl mb-8 ${lalezar.className}`}
        >
          ウォレットを生成
        </p>
        <div
          id="login-buttons"
          className="section mb-2 flex items-center justify-center"
        >
          {openIdProviders.map((provider) => (
            <button
              className={`btn-login text-black font-bold py-1 px-10 rounded border-[2px] border-gray-300 ${provider}`}
              onClick={() => {
                beginZkLogin(provider);
              }}
              key={provider}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/mercari.png"
                  alt="Mercari Logo"
                  width={50}
                  height={50}
                />
                <div className="mr-5 text-lg">Login with Mercari</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
