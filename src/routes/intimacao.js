const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, WebhookClient } = require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });
const generatePDF = require("../utils/generatePDF");
require("dotenv").config();
const moment = require("moment");

require("moment/locale/pt-br");

bot.login(process.env.BOT_TOKEN);

const router = express.Router();


const logWebhook = new WebhookClient({ url: process.env.intimacaoWebhook });

async function logIntimacao(nome, patente, hora, data, autor) {
    const logEmbed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle("📜 Nova Intimação Enviada")
        .addFields(
            { name: "👤 Intimado:", value: nome, inline: true },
            { name: "🎖️ Patente:", value: patente, inline: true },
            { name: "📅 Data:", value: moment(data).format('DD/MM/YYYY'), inline: true },
            { name: "⏰ Hora:", value: hora, inline: true },
            { name: "📢 Enviado por:", value: autor, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Corregedoria PMC", iconURL: process.env.CORRICON });

    await logWebhook.send({ embeds: [logEmbed] });
}


router.post("/enviar", async (req, res) => {
    try {
        
    const { discordId, nome, patente, hora, data } = req.body;
    const guild = await bot.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(req.user.id);

    if (!member.roles.cache.has(process.env.ROLE_ID)) {
        return res.status(400).json({ success: false, message: "Você não tem o cargo necessário!" });
    }


    if (!discordId || !nome || !patente || !hora || !data) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    const guildId = '1195033612349886504';
    let apelido = nome; // Nome padrão caso não consiga pegar o apelido

    try {
        // Obtém o servidor
        const guild = await bot.guilds.fetch(guildId);
        // Obtém o membro pelo discordId
        const member = await guild.members.fetch(discordId);
        // Obtém o apelido (ou nome de usuário se não tiver apelido)
        apelido = member.nickname || member.user.username;
    } catch (error) {
        console.error("Erro ao buscar apelido:", error);
    }

    const datas = {
        intimado: nome, // Agora o nome do intimado será o apelido do servidor
        patente: patente,
        dataComparecimento: data,
        horaComparecimento: hora,
        dataEmissao: moment().locale("pt-br"),
        userEmissao: apelido
       
    };
   
    const pdfPath = await generatePDF(datas);

    try {
        const user = await bot.users.fetch(discordId);
        const dm = await user.createDM();

        const timestamp = new Date();

        const embed = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("⚖️ Corregedoria Geral PMC - Intimação")
            .setDescription(
                `Olá, **${apelido}**! Você está sendo intimado a comparecer ao departamento para prestar esclarecimentos. **Abra o documento** para mais informações!`
            )
            .setTimestamp(timestamp)
            .setThumbnail(process.env.CORRICON)
            .setFooter({
                text: "Clique para baixar o PDF",
                iconURL: "https://cdn-icons-png.flaticon.com/512/4726/4726010.png",
            });

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmarLeitura2')
            .setLabel('Confirmar Leitura')
            .setStyle(ButtonStyle.Primary);

        const reagendarButton = new ButtonBuilder()
            .setCustomId('reagendar2')
            .setLabel('Reagendamento')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(confirmButton, reagendarButton);

        await dm.send({
            embeds: [embed],
            components: [actionRow],
            files: [pdfPath]
        });

        await logIntimacao(nome, patente, hora, data, req.user.username);

        res.json({ success: true, message: "Intimação enviada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/enviarbot", async (req, res) => {
    
    const { discordIdEmitente, discordId, nome, patente, hora, data } = req.body;
    

    if (!discordId || !nome || !patente || !hora || !data) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    const guildId = '1195033612349886504';
    let apelido = nome; // Nome padrão caso não consiga pegar o apelido

    try {
        // Obtém o servidor
        const guild = await bot.guilds.fetch(guildId);
        // Obtém o membro pelo discordId
        const member = await guild.members.fetch(discordIdEmitente);
        // Obtém o apelido (ou nome de usuário se não tiver apelido)
        apelido = member.nickname || member.user.username;
    } catch (error) {
        console.error("Erro ao buscar apelido:", error);
    }

    const datas = {
        intimado: nome, // Agora o nome do intimado será o apelido do servidor
        patente: patente,
        dataComparecimento: data,
        horaComparecimento: hora,
        dataEmissao: moment().locale("pt-br"),
        userEmissao: apelido
       
    };
   
    const pdfPath = await generatePDF(datas);

    try {
        const user = await bot.users.fetch(discordId);
        const dm = await user.createDM();

        const timestamp = new Date();

        const embed = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("⚖️ Corregedoria Geral PMC - Intimação")
            .setDescription(
                `Olá, **${apelido}**! Você está sendo intimado a comparecer ao departamento para prestar esclarecimentos. **Abra o documento** para mais informações!`
            )
            .setTimestamp(timestamp)
            .setThumbnail(process.env.CORRICON)
            .setFooter({
                text: "Clique para baixar o PDF",
                iconURL: "https://cdn-icons-png.flaticon.com/512/4726/4726010.png",
            });

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmarLeitura')
            .setLabel('Confirmar Leitura')
            .setStyle(ButtonStyle.Primary);

        const reagendarButton = new ButtonBuilder()
            .setCustomId('reagendar')
            .setLabel('Reagendamento')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(confirmButton, reagendarButton);

        await dm.send({
            embeds: [embed],
            components: [actionRow],
            files: [pdfPath]
        });

        await logIntimacao(nome, patente, hora, data, apelido);

        res.json({ success: true, message: "Intimação enviada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
