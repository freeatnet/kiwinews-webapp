with
  groups := (group Message by .href),
  formatted := (
    select groups {
      id,
      keyMessage := assert_exists(
        (
          select .elements 
          order by .timestamp asc
          limit 1
        ),
        message := "key message not found"
      ),
      points := count(.elements),
      upvoters := array_agg(.elements.identity),
    }
    order by .keyMessage.timestamp desc
    offset <int64>$from
    limit <int64>$amount
  )
select formatted {
  keyMessage: {
    id,
    href,
    title,
    identity,
    timestamp,
    signature,
    messageId,
  },
  points,
  upvoters
}