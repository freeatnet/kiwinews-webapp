CREATE MIGRATION m1b33lp2cpf75nxve3h4a6ghjwsaaoerdkdb3mlusnnwkv2aov4mba
    ONTO m12d2z3gtl3zutnlgdahmabji73jklpeo2pbjeyl4pf4rxnutsag2q
{
  ALTER TYPE default::Message {
      ALTER PROPERTY digest {
          RENAME TO messageId;
      };
  };
};
