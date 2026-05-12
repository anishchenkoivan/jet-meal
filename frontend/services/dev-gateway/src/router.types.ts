export type RouterYaml = {
  service: {
    id: string;
    port?: number;
    optional?: boolean;
  };
  spawn: {
    cwd: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
  };
  routes: Array<{ path: string }>;
};

export type ResolvedService = {
  id: string;
  port: number;
  optional: boolean;
  routerPath: string;
  spawn: RouterYaml["spawn"];
  routes: Array<{ path: string }>;
};

export type RouteEntry = {
  path: string;
  serviceId: string;
  port: number;
};
