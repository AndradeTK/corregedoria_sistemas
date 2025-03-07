require("dotenv").config();

module.exports = {
    clientId: process.env.CLIENT_ID,       // ID do bot
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI, // URL de redirecionamento do OAuth2
    token: process.env.BOT_TOKEN,          // Token do bot do Discord
    guildId: process.env.GUILD_ID,         // ID do servidor
    roleId: process.env.ROLE_ID            // ID do cargo necessário para acessar
};
