import { NextFunction, Request, Response } from "express";
import jwt,{JwtPayload} from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface CustomJwtPayload extends JwtPayload {
    userId:string
}

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function middleware(req:Request, res:Response, next:NextFunction){
    try {
        const token = req.headers["authorization"]?.replace("Bearer ", "") ?? "";
        
        if(!token) {
            return res.status(403).json({
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload ;
        
        if(decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({
                message: "Invalid token"
            });
        }
    } catch (error) {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
}