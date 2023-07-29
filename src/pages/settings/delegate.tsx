import { secp256k1 } from "@noble/curves/secp256k1";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { useCallback } from "react";
import invariant from "ts-invariant";
import { toHex, encodePacked, hexToNumber } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { useAccount, useContractWrite } from "wagmi";

const DELEGATE2_ADDR = "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2" as const;

const DELEGATE2_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32[3]",
        name: "data",
        type: "bytes32[3]",
      },
    ],
    name: "Delegate",
    type: "event",
  },
  {
    inputs: [{ internalType: "bytes32[3]", name: "data", type: "bytes32[3]" }],
    name: "etch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const DELEGATE_EIP712_DOMAIN = {
  name: "kiwinews",
  version: "1.0.0",
  chainId: 10, // optimism
  verifyingContract: "0x08b7ECFac2c5754ABafb789c84F8fa37c9f088B0",
  salt: "0xfe7a9d68e99b6942bb3a36178b251da8bd061c20ed1e795207ae97183b590e5b",
} as const;

export const DELEGATE_EIP712_TYPES = {
  Authorization: [
    { name: "from", type: "address" },
    { name: "authorize", type: "bool" },
  ],
} as const;

export const DELEGATE_EIP712_PRIMARY_TYPE = "Authorization" as const;

function toEIP2098CompactSignature(
  hex: `0x${string}`
): [`0x${string}`, `0x${string}`] {
  invariant(
    hex.startsWith("0x") && hex.length === 132,
    "the original signature must be a 65-byte 0x hex string"
  );

  let v = hexToNumber(`0x${hex.slice(130)}`);
  if (v === 0 || v === 1) v += 27;

  const signature = secp256k1.Signature.fromCompact(
    hex.substring(2, 130)
  ).addRecoveryBit(v - 27);

  const r = signature.r;
  const yParityAndS = (BigInt(signature.recovery) << BigInt(255)) | signature.s;

  return [toHex(r), toHex(yParityAndS)];
}

export default function SettingsDelegate() {
  const { address } = useAccount();

  const handleClick = useCallback(async () => {
    invariant(!!address);
    const AUTHORIZE_TRUE = true;

    const delegatePrivateKey = generatePrivateKey();
    const delegateAccount = privateKeyToAccount(delegatePrivateKey);

    const delegationMessage = {
      from: address,
      authorize: AUTHORIZE_TRUE,
    };

    const signatureHex = await delegateAccount.signTypedData({
      domain: DELEGATE_EIP712_DOMAIN,
      types: DELEGATE_EIP712_TYPES,
      primaryType: DELEGATE_EIP712_PRIMARY_TYPE,
      message: delegationMessage,
    });

    const [sigR, sigYParityAndS] = toEIP2098CompactSignature(signatureHex);
    const message = encodePacked(
      ["address", "uint96"],
      [delegateAccount.address, BigInt(AUTHORIZE_TRUE)]
    );

    const prepared = await prepareWriteContract({
      address: DELEGATE2_ADDR,
      abi: DELEGATE2_ABI,
      functionName: "etch",
      args: [
        [
          /**
            1. `data[0]` and `data[1]` are respectively the first and the second
                part of an EIP-2098 "Compact Signature."
            2. `data[2]` is a `bytes32` segmented into:

              0x4E774b8530d6f3A21C449A6f0D9A1229aB2b8C47000000000000000000000001
                ^                                      ^^                     ^^
                |                                      ||                     ||
                .--------------------------------------..---------------------.|
                (a bytes20-long `address to`)             (empty)              |
                                                                              |
                                                          (the `bool authorize`)
          */
          sigR,
          sigYParityAndS,
          message,
        ],
      ] as const,
      account: address,
    });

    writeContract(prepared);
  }, [address]);

  const { write } = useContractWrite();

  return <div />;
}
