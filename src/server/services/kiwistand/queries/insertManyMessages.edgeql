with
  messages := <array<tuple<
  identity: str,
  type: MessageType,
  href: str,
  title: str,
  timestamp: int64,
  signer: str,
  signature: evm::hexstr,
  messageId: evm::hexstr,
  >>>$messages
for message in array_unpack(messages) union (
  insert Message {
    identity := <evm::address>str_lower(message.identity),
    type := message.type,
    href := message.href,
    title := message.title,
    timestamp := message.timestamp,
    signer := <evm::address>str_lower(message.signer),
    signature := message.signature,
    messageId := message.messageId,
  }
  unless conflict
);
