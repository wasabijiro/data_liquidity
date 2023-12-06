"use client";

import { lalezar } from "@/app/fonts";
import { useState, useEffect } from "react";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { SUI_NETWORK } from "@/config/sui";
import { ETH_NETWORK } from "@/config/ethereum";
import { shortenAddress } from "@/utils";
import { Contract, ethers, Signer } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { CREDENTIALS_DB_ADDRESS } from "@/config";
import {
  readCredentialsCounter,
  readSchemaClaims,
  encryptWithMM,
  uploadEncryptedCredentialAndLeafToContract,
  ascii_to_hex,
  computeLeaf,
} from "@/libs/eth";
import CREDENTIAL_DB_ARTIFACT from "../../../artifacts/contracts/CredentialsDB.sol/CredentialsDB.json";

export default function Page() {
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  const [claimsArray, setClaimsArray] = useState<string[] | undefined>(
    undefined
  );
  const [credentialJSON, setCredentialJSON] = useState<
    | {
        claims: { [x: string]: string };
      }
    | undefined
  >(undefined);
  const [counter, setCounter] = useState<number>(0);
  const [openForm, setOpenForm] = useState(false);
  const [status, setStatus] = useState<
    "notyet" | "encrypting" | "computing" | "uploading" | "done"
  >("notyet");

  useEffect(() => {
    const initializeCredentialJSON = (walletAddress: string) => {
      const initialCredentialJSON = {
        claims: {
          ethAddress: walletAddress,
        },
      };
      setCredentialJSON(initialCredentialJSON);
    };

    const getPubKeyFromMM = async (walletAddress: string) => {
      await credentialSetup.getPubKeyFromMM(walletAddress);
    };
    if (credentialSetup.walletAddress) {
      console.log("##1##");
      initializeCredentialJSON(credentialSetup.walletAddress);
      getPubKeyFromMM(credentialSetup.walletAddress);
    }
  }, [credentialSetup.walletAddress]);

  const buttonName = () => {
    switch (status) {
      case "notyet":
        return "Issue";
      case "encrypting":
        return "Encrypting credential...";
      case "computing":
        return "Computing Credentials Merkle Tree leaf...";
      case "uploading":
        return "Uploading leaf to smart contract";
      case "done":
        return "Issurance Done!";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p
        className={`text-center text-black text-8xl mb-4 ${lalezar.className}`}
      >
        Issuer Portal
      </p>
      <div className="flex mb-2">
        <p
          className={`text-center text-black text-xl mb-8 ${lalezar.className}`}
        >
          zkLogin Address:
        </p>
        {zkLoginSetup.userAddr && (
          <b className="ml-2">
            <a
              className={`text-center text-blue-400 underline text-xl mb-8 ${lalezar.className}`}
              href={`https://suiexplorer.com/address/${zkLoginSetup.userAddr}?network=${SUI_NETWORK}}`}
            >
              {shortenAddress(zkLoginSetup.userAddr)}
            </a>
          </b>
        )}
      </div>
      <div>
        {credentialSetup.walletAddress == "" ? (
          <button
            className={`text-white text-xl py-3 px-5 rounded-xl bg-black hover:bg-slate-700 border-4 border-yellow-500 ${lalezar.className}`}
            onClick={() => credentialSetup.connectAccount()}
          >
            <div>Connect Ethereum Wallet</div>
          </button>
        ) : (
          <b className="ml-2">
            <a
              className={`text-white text-xl py-3 px-5 rounded-xl bg-black hover:bg-slate-700 border-4 border-yellow-500 ${lalezar.className}`}
              href={`https://${ETH_NETWORK}.etherscan.io/address/${credentialSetup.walletAddress}`}
            >
              {shortenAddress(credentialSetup.walletAddress)}
            </a>
          </b>
        )}
      </div>
      <button
        onClick={async () => {
          const claims = await readSchemaClaims(credentialSetup.credentialsDB);
          console.log({ claims });
          setClaimsArray(claims);
          const credentialsCounter = await readCredentialsCounter(
            credentialSetup.credentialsDB
          );
          console.log({ credentialsCounter });
          setCounter(credentialsCounter);
          setOpenForm(true);
        }}
        className="text-white py-3 px-5 mt-10 rounded-xl bg-blue-600 hover:bg-slate-700"
      >
        Read contract credential schema
      </button>
      {openForm && (
        <div className="w-1/2 flex flex-col justify-center">
          <div
            className={`text-center text-black text-xl mt-8 ${lalezar.className}`}
          >
            Number of credentials issued: {counter}
          </div>
          <form className="border-2 border-gray-300 p-4 mt-4 rounded-lg">
            {claimsArray?.map((val) => {
              return (
                <label key={val} className="flex flex-row mt-4 items-center">
                  <div
                    className={`text-black text-xl w-20 ${lalezar.className}`}
                    style={{ minWidth: "8rem" }}
                  >
                    {val}:
                  </div>
                  <input
                    name={val}
                    className={`w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${lalezar.className}`}
                    readOnly={val === "ethAddress"}
                    defaultValue={
                      val === "ethAddress" ? credentialSetup.walletAddress : ""
                    }
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const name = event.target.name;
                      const value = event.target.value;
                      if (credentialJSON === undefined) {
                        const newCredentialJSON = {
                          claims: { [name]: value },
                        };
                        console.log({ newCredentialJSON });
                        setCredentialJSON(newCredentialJSON);
                      } else {
                        const newCredentialJSON = credentialJSON;
                        newCredentialJSON.claims[name] = value;
                        setCredentialJSON(newCredentialJSON);
                      }
                    }}
                  />
                </label>
              );
            })}
          </form>
          <button
            onClick={async () => {
              console.log({ credentialJSON });
              setStatus("encrypting");
              const enc = encryptWithMM(
                credentialSetup.walletPublicKey,
                // @ts-ignore
                credentialJSON
              );
              console.log({ enc });
              setStatus("computing");
              const leaf = computeLeaf(
                // @ts-ignore
                credentialJSON,
                claimsArray
              );
              console.log({ leaf });
              setStatus("uploading");
              await uploadEncryptedCredentialAndLeafToContract(
                enc,
                credentialSetup.credentialsDB,
                leaf
              );
              console.log("success");
              setStatus("done");
            }}
            className="text-white py-3 px-5 mt-10 rounded-xl bg-blue-600 hover:bg-slate-700"
          >
            {buttonName()}
          </button>
        </div>
      )}
    </div>
  );
}
