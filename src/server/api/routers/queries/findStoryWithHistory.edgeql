with
  messageByDigest := assert_exists(
    (select Message filter .digest = <evm::hexstr>$digest),
    message := "message with specified digest not found"
  ),
select Message {
  id,
  href,
  title,
  identity,
  timestamp,
  signer,
  signature,
  digest,
}
filter .href = messageByDigest.href
order by .timestamp asc
