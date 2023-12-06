"use client";

import { useState } from "react";
import { lalezar } from "@/app/fonts";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { SUI_NETWORK } from "@/config/sui";
import { shortenAddress } from "@/utils";
import { useCredentialDB } from "@/libs/store/credentialDB";
import {
  readSchemaClaims,
  downloadEncryptedCredentialFromContract,
  decryptionWithMM,
} from "@/libs/eth";
import { ETH_NETWORK } from "@/config/ethereum";

const groth16 = require("snarkjs").groth16;

export default function Page() {
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  const [credentialNumber, setCredentialNumber] = useState<number>(0);
  const [credentialJSON, setCredentialJSON] = useState<
    | {
        claims: { [x: string]: string };
      }
    | undefined
  >(undefined);
  const [claimsArray, setClaimsArray] = useState<string[] | undefined>(
    undefined
  );
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p
        className={`text-center text-black text-8xl mb-8 ${lalezar.className}`}
      >
        Prover Portal
      </p>
      <div className="flex">
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
      <div className="mb-2">
        {credentialSetup.ethAddress == "" ? (
          <button
            className={`text-white text-xl py-3 px-5 rounded-xl bg-black hover:bg-slate-700 border-4 border-yellow-500 ${lalezar.className}`}
            onClick={() => credentialSetup.connectAccount()}
          >
            <div>Connect Wallet</div>
          </button>
        ) : (
          <b className="ml-2">
            <a
              className={`text-white text-xl py-3 px-5 rounded-xl bg-black hover:bg-slate-700 border-4 border-yellow-500 ${lalezar.className}`}
              href={`https://${ETH_NETWORK}.etherscan.io/address/${credentialSetup.ethAddress}`}
            >
              {shortenAddress(credentialSetup.ethAddress)}
            </a>
          </b>
        )}
      </div>
      <div
        className={`flex justify-center text-black text-3xl mt-4 ${lalezar.className}`}
      >
        Recover your credential
      </div>
      <div className="flex flex-row mt-4 gap-2">
        Input your credential #
        <input
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const val = Number.parseInt(event.target.value);
            setCredentialNumber(val);
          }}
          className="px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none"
        />
      </div>
      <button
        onClick={async () => {
          const claims = await readSchemaClaims(credentialSetup.credentialsDB);
          const enc = await downloadEncryptedCredentialFromContract(
            credentialNumber - 1,
            credentialSetup.credentialsDB
          );
          const credential = await decryptionWithMM(
            credentialSetup.ethAddress,
            enc
          );
          // @ts-ignore
          const credential_json = JSON.parse(credential);
          console.log({ claims });
          console.log({ credential_json });
          // @ts-ignore
          const disclosureVector = claims.map((x) => 0);

          console.log({ claims });
          console.log({ credential_json });

          setCredentialJSON(credential_json);
          setClaimsArray(claims);
          credentialSetup.setDisclosureVector(disclosureVector);
        }}
        className="text-white py-3 px-5 mt-10 rounded-xl bg-blue-600 hover:bg-slate-700"
      >
        Recover
      </button>
      {credentialJSON && claimsArray && (
        <div className="flex flex-col gap-2">
          <div
            className={`flex justify-center text-black text-3xl mt-4 ${lalezar.className}`}
          >
            Recovered credential
          </div>
          <ul>
            {claimsArray.map((claimNames) => {
              return (
                <li key={claimNames}>
                  {claimNames} = {credentialJSON.claims[claimNames]}
                </li>
              );
            })}
          </ul>
          <div
            className={`flex justify-center text-black text-3xl mt-4 ${lalezar.className}`}
          >
            Selective disclosure selection
          </div>
          {claimsArray.map((claimNames, index) => {
            return (
              <div key={claimNames} className="flex items-center">
                <input
                  type="checkbox"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    let newDisclosureVector = credentialSetup.disclosureVector;
                    // @ts-ignore
                    newDisclosureVector[index] = event.target.checked ? 1 : 0;
                    // @ts-ignore
                    credentialSetup.setDisclosureVector(newDisclosureVector);
                  }}
                />
                <p className="ml-2">{claimNames}</p>
              </div>
            );
          })}

          <button
            onClick={async () => {
              credentialSetup.generateProof(
                credentialNumber,
                credentialJSON,
                claimsArray,
                credentialSetup.disclosureVector
              );
              console.log("proof generation success!");
            }}
            className="text-white py-3 px-5 mt-5 rounded-xl bg-blue-600 hover:bg-slate-700"
          >
            Generate proof
          </button>
        </div>
      )}
    </div>
  );
}
