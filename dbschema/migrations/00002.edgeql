CREATE MIGRATION m1e32tiyooanrc66yvhoexssfqwg5bi37ctc35uumtwybxff2gl4la
    ONTO m1aogixbppygrtbuosszbnx7kcrvuelzr2f5hv3eggebc2k3jxkhnq
{
  CREATE FUNCTION default::scoreByDecayingPoints(age: std::float64, points: std::int64, AGE_BUCKET_WIDTH: std::int64, DECAY_FACTOR: std::float64, AGE_BUCKET_MAX: std::int64) ->  std::float64 USING (SELECT
      (points / (DECAY_FACTOR ^ std::min({(math::floor((age / AGE_BUCKET_WIDTH)) - 1), AGE_BUCKET_MAX})))
  );
};
