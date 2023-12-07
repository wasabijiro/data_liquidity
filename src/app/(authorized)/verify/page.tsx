"use client";

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { Contract, ethers, Signer } from "ethers";
// @ts-ignore
import { poseidon } from "circomlibjs";
import { useRouter } from "next/navigation";
import { lalezar } from "@/app/fonts";
import { useState } from "react";
import { useZkLoginSetup } from "@/libs/store/zkLogin";
import { SUI_NETWORK } from "@/config/sui";
import { useCredentialDB } from "@/libs/store/credentialDB";
import { ETH_NETWORK } from "@/config/ethereum";
import { verifyProof, readSchemaClaims } from "@/libs/eth";
import { shortenAddress, veryShortenAddress, fewShortenAddress } from "@/utils";

const groth16 = require("snarkjs").groth16;

const sd_vec = [0, 1, 0, 0, 0];

export default function Page() {
  const router = useRouter();
  const zkLoginSetup = useZkLoginSetup();
  const credentialSetup = useCredentialDB();
  const [proofSuccess, setProofSuccess] = useState<boolean>(false);
  const [claimsArray, setClaimsArray] = useState<any | undefined>(undefined);
  const [vals, setVals] = useState<string[] | undefined>(undefined);
  const [loading, setLoading] = useState<"not yet" | "loading" | "done">(
    "not yet"
  );

  const buttonName = () => {
    if (loading === "not yet") {
      return "証明を検証";
    } else if (loading === "loading") {
      return "検証中...";
    } else {
      return "完了！";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p
        className={`text-center text-black text-2xl mb-4 ${lalezar.className}`}
      >
        検証
      </p>
      <button
        onClick={async () => {
          setLoading("loading");
          const proof = {
            proof: {
              pi_a: [
                "9167408158932482841518812670443778992359534626805928036702022029923196240428",
                "18783333711021043501864852268964307131891087700282010407332388325502004462882",
                "1",
              ],
              pi_b: [
                [
                  "3248404031987391192665158928278322989644980680835883014041433277513917772891",
                  "5831072672648857162998469513300297311887747973465113200455804075554921514682",
                ],
                [
                  "4892935452763455031040913221773213407648571218871318261737134174203908107705",
                  "19885980010488083362500587251273302276898062236100190176201864609638500983362",
                ],
                ["1", "0"],
              ],
              pi_c: [
                "2775691810792624462071946218665254514328080590527501340608767492124550450795",
                "21334174688079196792431523393239336296924360971938741641503984872859718719665",
                "1",
              ],
              protocol: "groth16",
              curve: "bn128",
            },
            publicSignals: [
              "0",
              "611019973103370789823427947434669346919351194545",
              "0",
              "0",
              "0",
              "17047570274231931415607466517872807758007404167367178200967212400586541888482",
              "611019973103370789823427947434669346919351194545",
              "0",
              "1",
              "0",
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
            setLoading("done");
            credentialSetup.setIsVerified(true);
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
            router.push("/");
          }
        }}
        className="w-60 border-2 border-red-400 bg-white text-red-400 rounded-lg px-2 py-2 hover:bg-red-500 hover:text-white"
      >
        {buttonName()}
      </button>
      {credentialSetup.isVerified && (
        <div
          className={`flex justify-center text-black text-xs mt-4 ${lalezar.className}`}
        >
          証明の検証が成功しました！
        </div>
      )}
      {proofSuccess && claimsArray && (
        <div>
          <ul>
            {claimsArray.map((claimNames: any, index: any) => {
              return (
                <li
                  key={claimNames}
                  className={`text-center text-black text-lg mt-5 mb-3 ${lalezar.className}`}
                >
                  {claimNames} ={/* @ts-ignore */}
                  {/* {credentialSetup.disclosureVector[index] */}
                  {/* @ts-ignore */}
                  {sd_vec[index]
                    ? /* @ts-ignore */
                      fewShortenAddress(vals[index])
                    : `"Hidden"`}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
