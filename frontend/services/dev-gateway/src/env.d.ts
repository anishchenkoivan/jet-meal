declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LISTEN_HOST?: string;
      PORT?: string;
      JET_MEAL_DEV_GATEWAY_PORT_BASE?: string;
    }
  }
}

export {};
