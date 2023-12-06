"use client";

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { Contract, ethers, Signer } from "ethers";
// @ts-ignore
import { poseidon } from "circomlibjs";
import { lalezar } from "@/app/fonts";
import { useState } from "react";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { SUI_NETWORK } from "@/config/sui";
import { shortenAddress } from "@/utils";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { ETH_NETWORK } from "@/config/ethereum";
import { verifyProof, readSchemaClaims } from "@/libs/eth";

const groth16 = require("snarkjs").groth16;

const sd_vec = [0, 1, 1, 0, 0];

export default function Page() {
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  const [proofSuccess, setProofSuccess] = useState<boolean>(false);
  const [claimsArray, setClaimsArray] = useState<any | undefined>(undefined);
  const [vals, setVals] = useState<string[] | undefined>(undefined);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p
        className={`text-center text-black text-8xl mb-8 ${lalezar.className}`}
      >
        User Verify
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
      <button
        onClick={async () => {
          const proof = {
            proof: {
              pi_a: [
                "3134093701952948255987483340105196433436734894949025797514058056209562823457",
                "16894306686434006928327205552672913323587272645728134801427173031126724722885",
                "1",
              ],
              pi_b: [
                [
                  "4314618416991469549831588281268136933180676075807268653831413057151133878259",
                  "12367542692216287811070209704847191326488090461152429032539352487658924784546",
                ],
                [
                  "8918347443066582782661733229472823882458880919750588980942159236643900061657",
                  "8373965346097257497369574372197452991380460212375573176930917727485403227315",
                ],
                ["1", "0"],
              ],
              pi_c: [
                "1724456995768153897429839217003728276297993096817196388379874189078351304438",
                "18782208096478103812636886904087094011996985770186165457980302815807447223365",
                "1",
              ],
              protocol: "groth16",
              curve: "bn128",
            },
            publicSignals: [
              "0",
              "497345573232779024655543458828389333557862221081",
              "131260431295081",
              "0",
              "0",
              "8002520687730642413295116804169724186847549789690376580579941977181141971418",
              "497345573232779024655543458828389333557862221081",
              "0",
              "1",
              "1",
              "0",
              "0",
            ],
          };
          const res: any = await verifyProof(
            // credentialSetup.proofPack,
            proof,
            credentialSetup.credentialsDB,
            credentialSetup.signer
          );

          console.log({ res });

          if (res.result === true) {
            setIsVerified(true);
          }

          //Get Claims in string char
          const claims = await readSchemaClaims(credentialSetup.credentialsDB);
          console.log({ claims });
          setClaimsArray(claims);
          const ethAddressIndex = claims.indexOf("ethAddress");
          var credentialVals: any = [];

          for (var i = 0; i < claims.length; i++) {
            var hex = res?.Input[i].slice(2);
            hex = hex.replace(/^0+/, "");

            if (i !== ethAddressIndex) {
              var str: string = "";
              for (var n = 0; n < hex.length; n += 2) {
                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
              }
              credentialVals.push(str);
            } else {
              credentialVals.push("0x" + hex);
            }
          }
          setVals(credentialVals);
          if (res.result === true) {
            console.log("verify success");
            setProofSuccess(true);
          }
        }}
        className="text-white py-3 px-5 mt-5 rounded-xl bg-blue-600 hover:bg-slate-700"
      >
        Verify Proof
      </button>
      {isVerified && (
        <div
          className={`flex justify-center text-black text-xl mt-4 ${lalezar.className}`}
        >
          Proof Verified!
        </div>
      )}
      {proofSuccess && claimsArray && (
        <div>
          <div
            className={`flex justify-center text-black text-3xl mt-4 ${lalezar.className}`}
          >
            Credential claims:
          </div>
          <ul>
            {claimsArray.map((claimNames: any, index: any) => {
              return (
                <li key={claimNames}>
                  {claimNames} ={/* @ts-ignore */}
                  {/* {credentialSetup.disclosureVector[index] */}
                  {/* @ts-ignore */}
                  {sd_vec[index] ? /* @ts-ignore */ vals[index] : `"Hidden"`}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
