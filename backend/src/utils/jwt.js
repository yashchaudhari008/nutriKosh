import jwt from "jsonwebtoken";

const SESSION_TTL = "30d";

export function signSessionToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: SESSION_TTL,
  });
}

export function verifySessionToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
