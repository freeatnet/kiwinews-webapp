CREATE MIGRATION m12d2z3gtl3zutnlgdahmabji73jklpeo2pbjeyl4pf4rxnutsag2q
    ONTO m1e32tiyooanrc66yvhoexssfqwg5bi37ctc35uumtwybxff2gl4la
{
  ALTER TYPE default::Message {
      CREATE REQUIRED PROPERTY digest: evm::hexstr {
          SET REQUIRED USING (<evm::hexstr>'0x00');
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
