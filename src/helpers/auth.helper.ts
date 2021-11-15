import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Context } from "../models";

export const passwordHelper = {
    encode(plain: string) {
        const salt = bcrypt.genSaltSync(5);
        return bcrypt.hashSync(plain, salt);
    },
    compare(plain: string, hash: string) {
        return bcrypt.compareSync(plain, hash);
    },
};

if (!process.env?.JWT_SECRET?.length) {
    throw new Error("JWT_SECRET required");
}

export const jwtHelper = {
    encode(data: Context) {
        return jwt.sign(data, process.env?.JWT_SECRET);
    },
    decode(token: string) {
        try {
            return jwt.verify(token, process.env?.JWT_SECRET) as Context;
        } catch (e) {
            console.log(e);
            return null;
        }
    },
};
