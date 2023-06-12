type EnvBindings = {
  AE: AnalyticsEngineDataset;
  AUTH_TOKENS: string;
  EXPIRE: DurableObjectNamespace;
  R2: R2Bucket;
};
type Environment = {
  Bindings: EnvBindings;
  Variables: {
    ASSOCIATED_USER: string;
  }
};

