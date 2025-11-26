import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    userNome?: string;
    userLogadoId?: number;
    userLogadoNome?: string;
  }
}