declare global {
  namespace Express {
    interface Request {
      userId?: string;
      decode? : string
    }
  }
}

export {};
