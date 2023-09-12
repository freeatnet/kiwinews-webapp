module evm {
  scalar type address extending str {
    constraint expression on ( re_test(r'^0x[a-f0-9]{40}$', __subject__) );
  }

  scalar type hexstr extending str {
    constraint expression on ( re_test(r'^0x[a-f0-9]+$', __subject__) );
  }
}

module default {
  scalar type MessageType extending enum<amplify>;

  type Message {
    required identity: evm::address;
    required type: MessageType;
    required href: str;

    required title: str;
    required timestamp: int64;

    required signer: evm::address;
    required signature: evm::hexstr {
      constraint exclusive;
    }

    constraint exclusive on ((.identity, .href, .type));
    index on ((.href, .timestamp));
  }
}
