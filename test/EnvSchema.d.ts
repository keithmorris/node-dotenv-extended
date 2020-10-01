import { IEnvironmentMap } from "dotenv-extended";

declare module "dotenv-extended" {
  interface IEnvironmentMap {
    TEST_ONE: string;
    TEST_TWO: string;
    TEST_THREE: string;
  }
}

declare global{
  namespace NodeJS {
    interface ProcessEnv extends IEnvironmentMap {}
  }
}
