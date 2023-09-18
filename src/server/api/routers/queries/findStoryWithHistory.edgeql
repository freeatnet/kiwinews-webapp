with
  messageByMessageId := assert_exists(
    (select Message filter .messageId = <evm::hexstr>$messageId),
    message := "message with specified messageId not found"
  ),
select Message {
  id,
  href,
  title,
  identity,
  timestamp,
  signer,
  signature,
  messageId,
}
filter .href = messageByMessageId.href
order by .timestamp asc
