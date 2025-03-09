const express = require("express");
const router = express.Router();
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

// Criando o cliente do Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Logando no bot
client.login(process.env.BOT_TOKEN);

  
router.get("/", (req, res) => {
    res.render("login", {user: req.user});
});

router.get("/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/");

    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(req.user.id);

        if (!member.roles.cache.has(process.env.ROLE_ID)) {
            return res.redirect("/");
        }

        res.render("dashboard", { user: req.user});

    } catch (error) {
        console.error("Erro ao verificar cargo do usuário:", error);
        return res.redirect("/");
    }
});

module.exports = router;

/*
{
  id: '844606209314127882',
  username: 'andradetk',
  avatar: '42d4528d63d6c0e09b412bdc81fce8ca',
  discriminator: '0',
  public_flags: 64,
  flags: 64,
  banner: null,
  accent_color: 0,
  global_name: 'andradetk',
  avatar_decoration_data: null,
  collectibles: null,
  banner_color: '#000000',
  clan: null,
  primary_guild: null,
  mfa_enabled: true,
  locale: 'pt-BR',
  premium_type: 0,
  email: 'devandradetk@gmail.com',
  verified: true,
  provider: 'discord',
  accessToken: 'vA9st6ZzegmBLuhhXSCEbqkFTcGAEc',
  guilds: [
*/ 