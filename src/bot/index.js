const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, InteractionType, Routes, version: discordJsVersion } = require('discord.js');
const { REST } = require('@discordjs/rest');
const axios = require('axios');
const os = require('os');
const { exec } = require('child_process');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const botWebhook = process.env.botWebhook;
const ALLOWED_USER_ID = '844606209314127882'; // ID permitido para usar o comando /restart

// Registrar comandos Slash
(async () => {
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    console.log('Atualizando comandos do bot...');

    // Para todos os servidores
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: [
          {
            name: 'restart',
            description: 'Reinicia a VPS.',
          },
          {
            name: 'intimarembed',
            description: 'Cria um embed com botão para intimação e decisão.'
          },
        ],
      }
    );

    console.log('⚙️  » Comandos registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
})();

// Evento de inicialização do bot
client.once('ready', async () => {
  console.log(`🤖 » ${client.user.tag} geral online!`);
  client.user.setActivity('Site em manutenção! Novidades em breve...', { type: 'LISTENING' });

  try {
    if (botWebhook) {
      const guilds = await client.guilds.fetch(); // Obter a lista de servidores
      const totalGuilds = guilds.size;

      // Obter total de membros
      let totalMembers = 0;
      for (const guild of guilds.values()) {
        const fetchedGuild = await guild.fetch();
        totalMembers += fetchedGuild.memberCount;
      }

      // Montar payload para o webhook
      const webhookPayload = {
        embeds: [
          {
            color: 0,
            author: {
              name: `Bot iniciado - ${client.user.username}`,
              icon_url: client.user.displayAvatarURL()
            },
            fields: [
              { name: 'Bot', value: client.user.username, inline: true },
              { name: 'Bot ID', value: client.user.id, inline: true },
              { name: 'Discriminator', value: client.user.discriminator, inline: true },
              { name: 'Status', value: client.presence?.status || 'Indisponível', inline: true },
              { name: 'Servidores Conectados', value: `${totalGuilds}`, inline: true },
              { name: 'Total de Membros', value: `${totalMembers}`, inline: true },
              { name: 'Versão do Node.js', value: process.version, inline: true },
              { name: 'Versão do Discord.js', value: discordJsVersion, inline: true },
              { name: 'Hostname', value: os.hostname(), inline: true },
              { name: 'Sistema Operacional', value: `${os.type()} (${os.platform()} ${os.arch()})`, inline: true },
              { name: 'Uptime do Sistema', value: `${Math.floor(os.uptime() / 60)} minutos`, inline: true },
              { name: 'Memória Livre', value: `${Math.round(os.freemem() / 1024 / 1024)} MB`, inline: true },
              { name: 'Memória Total', value: `${Math.round(os.totalmem() / 1024 / 1024)} MB`, inline: true },
              { name: 'Hora de Inicialização', value: new Date().toISOString(), inline: false },
            ],
            thumbnail: {
              url: client.user.displayAvatarURL()
            },
            footer: {
              text: 'Sistema de Monitoramento de Bots - Painel Corregedoria',
              icon_url: 'https://media.discordapp.net/attachments/1222972528985772192/1291807066477957183/corr_icon.png?ex=673ebe55&is=673d6cd5&hm=68f8fe8e97fe65b500596900984a3593aaebd4e10608c82636b1b049d8c92846&=&format=webp&quality=lossless&width=662&height=662'
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      // Enviar informações para o webhook
      await axios.post(botWebhook, webhookPayload);
      console.log("🧾 » Status do bot enviado para o webhook com sucesso.");
    } else {
      console.warn("⚠️ » Webhook de status do bot não configurado. Verifique o arquivo .env.");
    }
  } catch (err) {
    console.error("❌ » Erro ao enviar o status do bot para o webhook:", err.response?.data || err.message);
  }
});

// Comando /restart
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== 'restart') return;

  if (interaction.user.id !== ALLOWED_USER_ID) {
    await interaction.reply({
      content: '❌ Você não tem permissão para usar este comando.',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply('🔄 Reiniciando a VPS...');

  exec('sudo reboot', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao reiniciar a VPS: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  });
});

// Manipular interações
client.on('interactionCreate', async (interaction) => {
    const guildId = process.env.GUILD_ID;
    let apelido
    try {
        // Obtém o servidor
        const guild = await client.guilds.fetch(guildId);
        // Obtém o membro pelo discordId
        const member = await guild.members.fetch(interaction.user.id);
        // Obtém o apelido (ou nome de usuário se não tiver apelido)
        apelido = member.nickname || interaction.user.tag;
    } catch (error) {
        console.error("Erro ao buscar apelido:", error);
    }

    if (interaction.isCommand() && interaction.commandName === 'intimarembed') {
        const allowedRoles = [process.env.ROLE_ID];
        const member = await interaction.guild.members.fetch(interaction.user.id);
        
        // Verifica se o usuário tem um dos cargos permitidos
        if (!allowedRoles.some(role => member.roles.cache.has(role))) {
          return interaction.reply({
            content: '❌ » Você não tem permissão para usar este comando.',
            ephemeral: true
          });
        }
        // Criar o embed com botão
        const embed = new EmbedBuilder()
          .setColor('#000000')
          .setAuthor({
             name: 'Corregedoria Geral PMC - Intimações',
             iconURL: process.env.CORRICON
            })
          .setImage(process.env.CORRBANNER)
          .setDescription('Clique no **botão abaixo** para iniciar o processo de intimação ou decisão. Você será solicitado a **preencher informações** como o ID do Discord do intimado, nome, patente, data e hora de comparecimento. Após preencher, a intimação será realizada e o intimado receberá o documento **em seu privado**.')
          .addFields([
            {
                name: 'Etapas do Processo:',
                value: '**1.** Preencha as informações no formulário e envie.\n**2**. A intimação será gerada.\n**3.** O intimado receberá a intimação em privado.\n`Caso falhar, verifique se o intimado aceita mensagens diretas.`',
                inline: false
            }
        ])    
          .setFooter({
            text: 'Sistemas PMC', 
            iconURL: process.env.CORRICON
          })
    
        const button = new ButtonBuilder()
          .setCustomId('intimar_button')
          .setLabel('INTIMAR')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⚖️')
          const button2 = new ButtonBuilder()
          .setCustomId('decisao_button')
          .setLabel('DECISÃO')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⛔')
    
        const row = new ActionRowBuilder().addComponents(button, button2);
    
        await interaction.reply({ embeds: [embed], components: [row] });
    }
    
    if (interaction.isButton() && interaction.customId === 'intimar_button') {
        const allowedRoles = [process.env.ROLE_ID, process.env.ROLE_ID2];
        const member = await interaction.guild.members.fetch(interaction.user.id);
        
        // Verifica se o usuário tem um dos cargos permitidos
        if (!allowedRoles.some(role => member.roles.cache.has(role))) {
          return interaction.reply({
            content: '❌ » Você não tem permissão para usar este comando.',
            ephemeral: true
          });
        }
        // Criar o modal
        const modal = new ModalBuilder()
          .setCustomId('intimar_modal')
          .setTitle('Realizar Intimação');
    
        const fields = [
          { id: 'discord_id', label: 'ID Discord', placeholder: '844606209314127882' },
          { id: 'intimado', label: 'Intimado', placeholder: 'Logan Andrade' },
          { id: 'patente', label: 'Patente Intimado', placeholder: 'Subtenente' },
          { id: 'data_comparecimento', label: 'Data de Comparecimento', placeholder: '29/08/2024' },
          { id: 'hora_comparecimento', label: 'Hora de Comparecimento', placeholder: '16:29' },
        ];
    
        const rows = fields.map((field) =>
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId(field.id)
              .setLabel(field.label)
              .setPlaceholder(field.placeholder)
              .setStyle(TextInputStyle.Short)
          )
        );
    
        modal.addComponents(rows);
    
        await interaction.showModal(modal);
    }

    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'intimar_modal') {
        await interaction.deferReply({ ephemeral: true });

        const data = {
        discordIdEmitente: interaction.user.id,
          discordId: interaction.fields.getTextInputValue('discord_id'),
          nome: interaction.fields.getTextInputValue('intimado'),
          patente: interaction.fields.getTextInputValue('patente'),
          data: interaction.fields.getTextInputValue('data_comparecimento'),
          hora: interaction.fields.getTextInputValue('hora_comparecimento')
        };
    
        try {
          const user = await client.users.fetch(data.discordId);
        } catch (error) {
          await interaction.editReply({
            content: '❌ » O ID Discord fornecido não é válido. Verifique o ID e tente novamente.',
            ephemeral: true
          });
          return;
        }

        try {
          const user = await client.users.fetch(data.discordId);
          await user.send('Olá! Como vai?');
        } catch (error) {
          await interaction.editReply({
            content: '❌ » O intimado não possui DMs abertas ou o ID fornecido está incorreto.',
            ephemeral: true
          });
          return;
        }

        try {
          const response = await axios.post(`http://localhost:3000/intimacao/enviarbot`, data, {
            headers: {
              Authorization: `Bearer teste-teste`
            }
          });

          await interaction.editReply({
            content: `✅ » Intimação de ${data.nome} foi realizada com sucesso!`,
        });
        } catch (error) {
          console.error('Erro ao enviar dados para a rota:', error);
          await interaction.reply({
            content: '❌ Erro ao realizar a intimação. Tente novamente mais tarde.',
            ephemeral: true
          });
        }
    }

// slaaaaaaaaaa

if (interaction.isButton() && interaction.customId === 'decisao_button') {
  const allowedRoles = [process.env.ROLE_ID, process.env.ROLE_ID2];
  const member = await interaction.guild.members.fetch(interaction.user.id);
  
  // Verifica se o usuário tem um dos cargos permitidos
  if (!allowedRoles.some(role => member.roles.cache.has(role))) {
    return interaction.reply({
      content: '❌ » Você não tem permissão para usar este comando.',
      ephemeral: true
    });
  }
  // Criar o modal
  const modal = new ModalBuilder()
    .setCustomId('decisao_modal')
    .setTitle('Realizar Decisão');

  const fields = [
    { id: 'discord_id', label: 'ID Discord', placeholder: '844606209314127882' },
    { id: 'intimado', label: 'Intimado', placeholder: 'Logan Andrade' },
    { id: 'patente', label: 'Patente Intimado', placeholder: 'Subtenente' },
    { id: 'punicao', label: 'Punição', placeholder: 'Advertência 2' },
    { id: 'prazoRecurso', label: 'Prazo de Recurso', placeholder: '3 dias' },
  ];

  const rows = fields.map((field) =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(field.id)
        .setLabel(field.label)
        .setPlaceholder(field.placeholder)
        .setStyle(TextInputStyle.Short)
    )
  );

  modal.addComponents(rows);

  await interaction.showModal(modal);
}

if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'decisao_modal') {
  await interaction.deferReply({ ephemeral: true });

  const data = {
  discordIdEmitente: interaction.user.id,
    discordId: interaction.fields.getTextInputValue('discord_id'),
    nome: interaction.fields.getTextInputValue('intimado'),
    patente: interaction.fields.getTextInputValue('patente'),
    punicao: interaction.fields.getTextInputValue('punicao'),
    prazoRecurso: interaction.fields.getTextInputValue('prazoRecurso')
  };

  try {
    const user = await client.users.fetch(data.discordId);
  } catch (error) {
    await interaction.editReply({
      content: '❌ » O ID Discord fornecido não é válido. Verifique o ID e tente novamente.',
      ephemeral: true
    });
    return;
  }

  try {
    const user = await client.users.fetch(data.discordId);
    await user.send('Olá! Como vai?');
  } catch (error) {
    await interaction.editReply({
      content: '❌ » O intimado não possui DMs abertas ou o ID fornecido está incorreto.',
      ephemeral: true
    });
    return;
  }

  try {
    const response = await axios.post(`http://localhost:3000/decisao/enviarbot`, data, {
      headers: {
        Authorization: `Bearer teste-teste`
      }
    });

    await interaction.editReply({
      content: `✅ » Decisão de ${data.nome} foi realizada com sucesso!`,
  });
  } catch (error) {
    console.error('Erro ao enviar dados para a rota:', error);
    await interaction.reply({
      content: '❌ Erro ao realizar a intimação. Tente novamente mais tarde.',
      ephemeral: true
    });
  }
}






/*
    if (interaction.isButton()) {
        // Botão de Confirmar Leitura
        if (interaction.customId === 'confirmar_leitura') {
          const logChannel = await client.channels.fetch('1308851553506951208'); // Canal onde será registrado
    
          if (!logChannel) {
            return interaction.reply({ content: '❌ Canal não encontrado.', ephemeral: true });
          }
    
          // Enviar mensagem informando que o usuário visualizou a intimação
          await logChannel.send(`${interaction.user.tag} (ID: ${interaction.user.id}) visualizou a intimação.`);
    
          await interaction.reply({
            content: '✅ » A leitura foi confirmada com sucesso!',
            ephemeral: true
          });
        }
    
        // Botão de Reagendar
        if (interaction.customId === 'reagendar') {
          const categoriaID = '1335019585467842570'; // ID da categoria onde o canal será criado
          const categoria = await client.channels.fetch(categoriaID);
          console.log(categoria)
    
          if (!categoria) {
            return interaction.reply({
              content: '❌ » Não foi possível encontrar a categoria para criar o canal.',
              ephemeral: true
            });
          }
    
          // Criar o canal com o nome "intimacao-username"
          const canalNome = `intimacao-${interaction.user.username}`;
    
          // Criando o canal dentro da categoria, com permissões para o usuário interagir
          const novoCanal = await interaction.guild.channels.create(canalNome, {
            type: 'GUILD_TEXT',
            parent: categoria.id,  // Especifica a categoria para o canal
            permissionOverwrites: [
              {
                id: interaction.user.id,
                allow: ['VIEW_CHANNEL'],
              },
            ],
          });
    
          // Enviar mensagem de sucesso no novo canal
          await novoCanal.send(`🔔 **Novo canal para reagendamento** criado para a intimação de ${interaction.user.tag} (${interaction.user.id})`);
    
          await interaction.reply({
            content: `✅ » O canal **${canalNome}** foi criado com sucesso!`,
            ephemeral: true
          });
        }
      } */


        if (!interaction.isButton()) return;

    // Buscar a guild (servidor) manualmente
    const guild = await client.guilds.fetch(process.env.GUILD_ID).catch(() => null);
    if (!guild) {
        return interaction.reply({ content: '❌ Erro: Não foi possível acessar o servidor.', ephemeral: true });
    }

    // Pegar a mensagem original do embed
    const message = interaction.message;

    // Criar uma nova ActionRow sem o botão pressionado
    let updatedComponents = message.components.map(row => {
        return new ActionRowBuilder().addComponents(
            row.components.filter(component => component.customId !== interaction.customId)
        );
    }).filter(row => row.components.length > 0); // Remove ActionRows vazias

    // Botão de Confirmar Leitura
    if (interaction.customId === 'confirmarLeitura') {
        const logChannel = await guild.channels.fetch('1308851553506951208').catch(() => null);
        if (!logChannel) {
            return interaction.reply({ content: '❌ » Canal de logs não encontrado.', ephemeral: true });
        }
      
        await logChannel.send(`📢 » **${apelido}** (ID: **${interaction.user.id}**) visualizou a intimação.`);
        await interaction.reply({ content: '✅ » A leitura foi confirmada com sucesso!', ephemeral: true });

        // Editar a mensagem original removendo o botão
       await message.edit({ components: updatedComponents });
    }

    // Botão de Reagendar
    if (interaction.customId === 'reagendar') {
        const categoriaID = process.env.CATEGORIA_ID;
        const categoria = await guild.channels.fetch(categoriaID).catch(() => null);

        if (!categoria) {
            return interaction.reply({ content: '❌ » Não foi possível encontrar a categoria para criar o canal.', ephemeral: true });
        }

        const canalNome = `✉️┋intimacao-${interaction.user.username}`;
        const novoCanal = await guild.channels.create({
            name: canalNome,
            type: 0, // Canal de texto
            parent: categoria.id,
            permissionOverwrites: [
                { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                { id: guild.roles.everyone.id, deny: ['ViewChannel'] }
            ],
        });
        
       /* await novoCanal.send(`🔔 **Novo canal para reagendamento da audiência!** \n \n**Réu:** *${apelido} (${interaction.user.id})*\n\n||<@${interaction.user.id}> <@&1308645932492918814>||`);*/
       const embed = new EmbedBuilder()
       .setColor('#000000')
       .setAuthor({
           name: 'Corregedoria Geral PMC - Reagendamento da Intimação',
           iconURL: process.env.CORRICON
       })
       .setImage(process.env.CORRBANNER)
       .setDescription(`Olá, **${apelido} (${interaction.user.id})**! Caso precise reagendar a data da intimação, você pode solicitar um **reagendamento**. Siga as etapas abaixo para garantir que seu pedido seja analisado corretamente.`)
       .addFields([
           {
               name: '📌 Etapas do Processo:',
               value: '**1.** Clique no botão para iniciar o reagendamento.\n**2.** Mande abaixo informações necessárias, incluindo nome, patente, justificativa, data e horário disponiveis.\n **3.** Aguarde a análise da corregedoria.',
               inline: false
           },
           {
               name: '⚠ Importante:',
               value: 'O pedido de reagendamento não troca a data automaticamente. Ele será analisado conforme a agenda da Corregedoria.',
               inline: false
           }
       ])
       .setFooter({
           text: 'Sistemas PMC',
           iconURL: process.env.CORRICON
       });

// Enviar a mensagem com a menção fora do embed
await novoCanal.send({
    content: `||<@${interaction.user.id}> <@&${process.env.ROLE_ID}>||`, // Menção fora do embed
    embeds: [embed]
});
        await interaction.reply({ content: `✅ » O canal para reagendamento **${canalNome}** foi criado com sucesso!`, ephemeral: true });

        // Editar a mensagem original removendo o botão
        await message.edit({ components: updatedComponents });
    }
    if (interaction.customId === 'confirmarLeitura2') {
        const logChannel = await guild.channels.fetch(process.env.AR_CANAL).catch(() => null);
        if (!logChannel) {
            return interaction.reply({ content: '❌ » Canal de logs não encontrado.', ephemeral: true });
        }
      
        await logChannel.send(`📢 » **${apelido}** (ID: **${interaction.user.id}**) visualizou a intimação.`);
        await interaction.reply({ content: '✅ » A leitura foi confirmada com sucesso!', ephemeral: true });

    }

    // Botão de Reagendar
    if (interaction.customId === 'reagendar2') {
        const categoriaID = process.env.CATEGORIA_ID;
        const categoria = await guild.channels.fetch(categoriaID).catch(() => null);

        if (!categoria) {
            return interaction.reply({ content: '❌ » Não foi possível encontrar a categoria para criar o canal.', ephemeral: true });
        }

        const canalNome = `intimacao-${interaction.user.username}`;
        const novoCanal = await guild.channels.create({
            name: canalNome,
            type: 0, // Canal de texto
            parent: categoria.id,
            permissionOverwrites: [
                { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                { id: guild.roles.everyone.id, deny: ['ViewChannel'] }
            ],
        });
        
       /* await novoCanal.send(`🔔 **Novo canal para reagendamento da audiência!** \n \n**Réu:** *${apelido} (${interaction.user.id})*\n\n||<@${interaction.user.id}> <@&1308645932492918814>||`);*/
       const embed = new EmbedBuilder()
       .setColor('#000000')
       .setAuthor({
           name: 'Corregedoria Geral PMC - Reagendamento da Intimação',
           iconURL: process.env.CORRICON
       })
       .setImage(process.env.CORRBANNER)
       .setDescription(`Olá, **${apelido} (${interaction.user.id})**! Caso precise reagendar a data da intimação, você pode solicitar um **reagendamento**. Siga as etapas abaixo para garantir que seu pedido seja analisado corretamente.`)
       .addFields([
           {
               name: '📌 Etapas do Processo:',
               value: '**1.** Clique no botão para iniciar o reagendamento.\n**2.** Mande abaixo informações necessárias, incluindo nome, patente, justificativa, data e horário disponiveis.\n **3.** Aguarde a análise da corregedoria.',
               inline: false
           },
           {
               name: '⚠ Importante:',
               value: 'O pedido de reagendamento não troca a data automaticamente. Ele será analisado conforme a agenda da Corregedoria.',
               inline: false
           }
       ])
       .setFooter({
           text: 'Sistemas PMC',
           iconURL: process.env.CORRICON
       });

// Enviar a mensagem com a menção fora do embed
await novoCanal.send({
    content: `||<@${interaction.user.id}> <@&${process.env.ROLE_ID}>||`, // Menção fora do embed
    embeds: [embed]
});
        await interaction.reply({ content: `✅ » O canal para reagendamento **${canalNome}** foi criado com sucesso!`, ephemeral: true });

    }


    /*Decisao*/

    if (interaction.customId === 'confirmarLeitura3') {
      const logChannel = await guild.channels.fetch(process.env.AR_CANAL).catch(() => null);
      if (!logChannel) {
          return interaction.reply({ content: '❌ » Canal de logs não encontrado.', ephemeral: true });
      }
    
      await logChannel.send(`📢 » **${apelido}** (ID: **${interaction.user.id}**) visualizou a decisão.`);
      await interaction.reply({ content: '✅ » A leitura foi confirmada com sucesso!', ephemeral: true });

      // Editar a mensagem original removendo o botão
     await message.edit({ components: updatedComponents });
  }
  
  if (interaction.customId === 'recurso') {
      const categoriaID = process.env.CATEGORIA_ID;
      const categoria = await guild.channels.fetch(categoriaID).catch(() => null);

      if (!categoria) {
          return interaction.reply({ content: '❌ » Não foi possível encontrar a categoria para criar o canal.', ephemeral: true });
      }

      const canalNome = `⚖️┋decisao-${interaction.user.username}`;
      const novoCanal = await guild.channels.create({
          name: canalNome,
          type: 0, // Canal de texto
          parent: categoria.id,
          permissionOverwrites: [
              { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
              { id: guild.roles.everyone.id, deny: ['ViewChannel'] }
          ],
      });
      
     /* await novoCanal.send(`🔔 **Novo canal para reagendamento da audiência!** \n \n**Réu:** *${apelido} (${interaction.user.id})*\n\n||<@${interaction.user.id}> <@&1308645932492918814>||`);*/
     const embed = new EmbedBuilder()
     .setColor('#000000')
    .setAuthor({
        name: 'Corregedoria Geral PMC - Recurso de Decisão',
        iconURL: process.env.CORRICON
    })
    .setImage(process.env.CORRDECISAO)
    .setDescription(`Olá, **${apelido} (${interaction.user.id})**! Caso discorde da decisão aplicada, você pode solicitar um **recurso** para revisão. Siga as etapas abaixo para garantir que seu pedido seja analisado corretamente.`)
    .addFields([
        {
            name: '📌 Etapas do Processo:',
            value: '**1.** Clique no botão para iniciar o pedido de recurso.\n**2.** Mande abaixo informações necessárias, incluindo nome, patente e justificativa.\n**3.** Anexe provas como vídeos, prints ou testemunhas.\n**4.** Aguarde a análise da corregedoria.',
            inline: false
        },
        {
            name: '⚠ Importante:',
            value: 'O pedido de recurso não suspende automaticamente a punição aplicada. Ele será analisado conforme as evidências apresentadas.',
            inline: false
        }
    ])
    .setFooter({
        text: 'Sistemas PMC',
        iconURL: process.env.CORRICON
    });
     /*
  .setColor("#000000") // Cor do embed
  .setTitle("🎓 Recurso da Decisão!")
  .setDescription(`**Réu:** *${apelido} (${interaction.user.id})*`)
  .setTimestamp()
  .setFooter({ text: "Corregedoria PMC", iconURL: interaction.user.displayAvatarURL() });*/

// Enviar a mensagem com a menção fora do embed
await novoCanal.send({
  content: `||<@${interaction.user.id}> <@&${process.env.ROLE_ID}>||`, // Menção fora do embed
  embeds: [embed]
});
      await interaction.reply({ content: `✅ » O canal para recurso **${canalNome}** foi criado com sucesso!`, ephemeral: true });

      // Editar a mensagem original removendo o botão
      await message.edit({ components: updatedComponents });
  }
});

// Logar o bot
client.login(BOT_TOKEN);
