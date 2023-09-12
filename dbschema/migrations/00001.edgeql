CREATE MIGRATION m1aogixbppygrtbuosszbnx7kcrvuelzr2f5hv3eggebc2k3jxkhnq
    ONTO initial
{
  CREATE MODULE evm IF NOT EXISTS;
  CREATE SCALAR TYPE default::MessageType EXTENDING enum<amplify>;
  CREATE SCALAR TYPE evm::address EXTENDING std::str {
      CREATE CONSTRAINT std::expression ON (std::re_test('^0x[a-f0-9]{40}$', __subject__));
  };
  CREATE SCALAR TYPE evm::hexstr EXTENDING std::str {
      CREATE CONSTRAINT std::expression ON (std::re_test('^0x[a-f0-9]+$', __subject__));
  };
  CREATE TYPE default::Message {
      CREATE REQUIRED PROPERTY href: std::str;
      CREATE REQUIRED PROPERTY identity: evm::address;
      CREATE REQUIRED PROPERTY type: default::MessageType;
      CREATE CONSTRAINT std::exclusive ON ((.identity, .href, .type));
      CREATE REQUIRED PROPERTY timestamp: std::int64;
      CREATE INDEX ON ((.href, .timestamp));
      CREATE REQUIRED PROPERTY signature: evm::hexstr {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY signer: evm::address;
      CREATE REQUIRED PROPERTY title: std::str;
  };
};
