const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
require("dotenv").config();
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const redirectUri = process.env.REDIRECT_URI
const guildId = process.env.GUILD_ID
const roleId = process.env.ROLE_ID

const axios = require('axios');  // Adicione a biblioteca axios para chamadas HTTP

passport.use(
    new DiscordStrategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: redirectUri,
            scope: ["identify", "guilds", "guilds.members.read"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Requisição para pegar os membros do servidor
                const res = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`, {
                    headers: {
                        Authorization: `Bot ${process.env.BOT_TOKEN}`, // Certifique-se de usar um token de bot válido
                    }
                });

                const member = res.data;
                if (!member || !member.roles.includes(roleId)) {
                    return done(null, false, { message: "Acesso negado" });
                }
                return done(null, profile);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
