import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { Contract, ethers, Signer } from "ethers";
import { CREDENTIALS_DB_ADDRESS } from "@/config";
import CREDENTIAL_DB_ARTIFACT from "../../../artifacts/contracts/CredentialsDB.sol/CredentialsDB.json";
import type { credentisalState } from "@/types";
import { generateMerkleProof, generateZKProof } from "@/libs/eth";

export const useCredentialDB = create<credentisalState>((set, get) => ({
  credentialsDB: undefined,
  walletAddress: "",
  walletPublicKey: "",
  provider: undefined,
  signer: undefined,
  proofPack: {
    proof: "",
    publicSignals: "",
  },
  disclosureVector: [],
  connectAccount: async () => {
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      const accounts = await window.ethereum.request!({
        method: "eth_requestAccounts",
      });
      // @ts-ignore
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      if (provider) {
        const abi = new ethers.utils.Interface(CREDENTIAL_DB_ARTIFACT.abi);
        const creDB = new ethers.Contract(CREDENTIALS_DB_ADDRESS, abi, signer);
        console.log({ creDB });
        set({ credentialsDB: creDB });
      }
      set({ walletAddress: accounts[0] });
      set({ provider: provider });
      set({ signer: signer });
    }
  },
  getPubKeyFromMM: async (walletAddress: string) => {
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      const keyB64 = (await window.ethereum.request!({
        method: "eth_getEncryptionPublicKey",
        params: [walletAddress],
      })) as string;
      console.log({ keyB64 });
      //if you want base 64 encoded
      set({ walletPublicKey: keyB64 });
      //if you want the decoded form bytes32 like
      //return ethers.utils.base64.decode(keyB64)
    }
  },
  generateProof: async (
    credentialNumber: number,
    credentialJSON: any,
    claimsArray: any,
    disclosureVector: any
  ) => {
    const merkleProof = await generateMerkleProof(
      get().credentialsDB,
      credentialNumber
    );
    console.log({ merkleProof });
    const { proof, publicSignals } = await generateZKProof(
      credentialJSON,
      claimsArray,
      merkleProof,
      disclosureVector
    );

    const proofPack = {
      proof: proof,
      publicSignals: publicSignals,
    };

    console.log({ proofPack });

    set({ proofPack: proofPack });
  },
  setDisclosureVector: (disclosureVector: number[]) => {
    set({ disclosureVector: disclosureVector });
  },
  getInfo: () => ({
    // @ts-ignore
    credentialsDB: get().credentialsDB,
    // @ts-ignore
    walletAddress: get().walletAddress,
    // @ts-ignore
    walletPublicKey: get().walletPublicKey,
    // @ts-ignore
    provider: get().provider,
    // @ts-ignore
    signer: get().signer,
  }),
}));