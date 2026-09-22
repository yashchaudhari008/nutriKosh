import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signSessionToken } from "../utils/jwt.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res) {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  const user = await User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      $set: {
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sessionToken = signSessionToken(user._id);
  res.json({ token: sessionToken, user });
}

export async function logout(req, res) {
  // Bearer-token sessions are stateless on the server, so logout is a client-side no-op.
  res.json({ ok: true });
}
