with
  currentEpoch := datetime_get(datetime_of_statement(), 'epochseconds'),
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
      score := scoreByDecayingPoints(
        <int64>(
            currentEpoch
            - assert_exists(
                (
                  select .elements 
                  order by .timestamp asc
                  limit 1
                ),
                message := "key message not found"
              ).timestamp
          ),
        count(.elements),
        43200, # AGE_BUCKET_WIDTH
        4.0, # DECAY_FACTOR
        14 # AGE_BUCKET_MAX = 1 week / AGE_BUCKET_WIDTH
      )
    }
    filter 
      .keyMessage.timestamp > currentEpoch - 604800
      and .points > 1
    order by .score desc
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
  upvoters,
  score,
}