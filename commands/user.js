let { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
	  .setDescription('Get info of a user.')
    .addStringOption(option => option.setName("id").setDescription("Server ID.").setRequired(true)),
  
  async execute(client, embed, MessageEmbed, config, embedConfig, Permissions, interaction, tick, cross, axios, APIFetcher, bytesConverter, percentageCalculator, timeConverter){
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    let input = await interaction.options.getString("id") || "";
      
    if (input.length != 8) {
      embed.setTitle("Please provide a correct server identifier.")
        .setDescription(`Don't know what a server identifier is?
        Open your server's console and see the code at the last of console url.
        Eg- \`https://your.host.url/server/4c09a487\`.
        Here, \`4c09a487\` is the server identifier.`)
        .setColor(embedConfig.errorColor)
      
      await interaction.editReply({embeds: [embed]}).catch(error => {
        console.log(error);
      });

      return;
    }
      
    try {
      let responseData = await APIFetcher(client, "client", `/servers/${input}/resources/`, 1)
      let attributes = responseData.attributes
      let state = attributes.current_state
      let isSuspended = attributes.is_suspended
      let resources = attributes.resources
      let cpuUsage = `${resources.cpu_absolute.toFixed(2)}`
      let ramUsage = resources.memory_bytes/(1024*1024)
      let diskUsage = resources.disk_bytes/(1024*1024)
      let uptime = timeConverter(resources.uptime, "ms")
      let networkOut = bytesConverter(resources.network_tx_bytes, "Byte");
      let networkIn = bytesConverter(resources.network_rx_bytes, "Byte");
      responseData = await APIFetcher(client, "client", `/servers/${input}/`, 1)
      attributes = responseData.attributes
      let name = attributes.name
      let node = attributes.node
      let id = attributes.internal_id;
      let uuid = attributes.uuid
      let description = attributes.description || " "
      
      if(description.length > 100){
        description.length = 97
        description = description + "..."
      }
      
      let ramTotal = attributes.limits.memory
      let diskTotal = attributes.limits.disk
      let cpuTotal = `${attributes.limits.cpu.toFixed(2)}`
      let databases = attributes.feature_limits.databases
      let ports = attributes.feature_limits.allocations
      let backups = attributes.feature_limits.backups
      let isInstalling = attributes.is_installing
      let RAM, DISK, CPU
      let sftpHost = attributes.sftp_details.ip;
      let sftpPort = attributes.sftp_details.port;
      let dockerImage = attributes.docker_image;
      let startupParam = attributes.invocation;
      
      if(ramTotal <= 0.00){
        RAM = `${bytesConverter(ramUsage, "MB")} Used`
      }else{
        RAM = `${bytesConverter(ramUsage, "MB")}/${bytesConverter(ramTotal, "MB")} [${percentageCalculator(ramUsage, ramTotal)}%]`
      }

      RAM = RAM.replace(".00", "").replace(".00", "");
      
      if(diskTotal <= 0.00){
        DISK = `${bytesConverter(diskUsage, "MB")} Used`
      }else{
        DISK = `${bytesConverter(diskUsage, "MB")}/${bytesConverter(diskTotal, "MB")} [${percentageCalculator(diskUsage, diskTotal)}%]`
      }

      DISK = DISK.replace(".00", "").replace(".00", "");
      
      if(cpuTotal <= 0.00){
        CPU = `${cpuUsage}% Used`
      }else{
        CPU = `${cpuUsage}%/${cpuTotal}%`
      }

      CPU = CPU.replace(".00", "").replace(".00", "");
      
      if(isInstalling){
        embed.setTitle("Server Stats")
          .setDescription(`
            **ID**- \`${id}\`.
            **UUID**- \`${uuid}\`.
            **Name**- \`${name}\`.
            **Description**- \`${description}\`.
            **Node**- \`${node}\`.
            **INSTALLING**.
          `)
          .setColor(embedConfig.defaultColor)
      }else if(isSuspended){
        embed.setTitle("Server Stats")
          .setDescription(`
            **ID**- \`${id}\`.
            **UUID**- \`${uuid}\`.
            **Name**- \`${name}\`.
            **Description**- \`${description}\`.
            **Node**- \`${node}\`.
            **SUSPENDED**.
          `)
          .setColor(embedConfig.errorColor)
      }else{
        embed.setTitle("Server Stats")
          .setDescription(`
            **ID**- \`${id}\`.
            **UUID**- \`${uuid}\`.
            **Name**- \`${name}\`.
            **Description**- \`${description}\`.
            **Node**- \`${node}\`.
            **State**- \`${state}\`.
            **Uptime**- \`${uptime}\`.
            **Resources**-
            ㅤ**RAM**- \`${RAM}\`.
            ㅤ**CPU**- \`${CPU}\`.
            ㅤ**Disk**- \`${DISK}\`.
            ㅤ**Databases**- \`${databases}\`.
            ㅤ**Ports**- \`${ports}\`.
            ㅤ**Backups**- \`${backups}\`.
            **Network**-
            ㅤ**In**- \`${networkIn}\`.
            ㅤ**Out**- \`${networkOut}\`.
            **SFTP**-
            ㅤ**Host**- \`${sftpHost}\`.
            ㅤ**Port**- \`${sftpPort}\`.
            **Docker Image**- \`${dockerImage}\`.
            **Startup Parameter**-
            \`\`\`\n${startupParam}\n\`\`\`
          `)
          .setColor(embedConfig.successColor)
      }
      
      await interaction.editReply({embeds: [embed]}).catch(error => {
        console.log(error);
      });
    }catch(error){
      console.log(error);

      embed.setTitle("Invalid Server Identifier.")
        .setDescription(`Don't know what a server identifier is?
        Open your server's console and see the code at the last of console url.
        Eg- \`https://your.host.url/server/4c09a487\`.
        Here, \`4c09a487\` is the server identifier.`)
        .setColor(embedConfig.errorColor)
    
      await interaction.editReply({embeds: [embed]}).catch(error => {
        console.log(error);
      });
      
      return
    }
  },
}














/*
module.exports = {
  name : 'user',
  description : 'Info of a user',
        
  async run(Discord, client, prefix, message, args, axios, adminRoleID, APIFetcher, bytesConverter, percentageCalculator, timeConverter){
    if(!message.member.roles.cache.has(adminRoleID)){
      return;
    }
    let embed = new Discord.MessageEmbed()
    .setColor(0x95fd91)
    if((!args[0]) || isNaN(args[0])){
      embed.setDescription("Please provide a user ID")
      .setColor(0xff4747)
      await message.reply({embeds: [embed]}).catch(error => {})
      return
    }
    try {
      let responseData = await APIFetcher(client, "application", `/users/${args[0]}`, 1)
      console.log(responseData)
  
      let attributes = responseData.attributes;
      let id = attributes.id;
      let uuid = attributes.uuid;
      let username = attributes.username;
      let email = attributes.email;
      let firstName = attributes.first_name;
      let lastName = attributes.last_name;
      let isAdmin = attributes.root_admin;
      let created = attributes.created_at;
      let lastUpdated = attributes.updated_at;

      embed.setAuthor(message.author.username, message.author.avatarURL())
      .setTitle("USER DETAILS")
      .setDescription(`**ID**- \`${id}\`
      **UUID**- \`${uuid}\`
      **Username**- \`${username}\`
      **Email**- \`${email}\`
      **First Name**- \`${firstName}\`
      **Last Name**- \`${lastName}\`
      **Administrator**- \`${isAdmin}\`
      **Account Created**- \`${created}\`
      **Last Updated**- \`${lastUpdated}\``)
      await message.reply({embeds: [embed]}).catch(error => {})
    } catch {
      embed.setTitle("Wrong user ID provided")
      .setDescription(`Use the command \`${prefix}users\` to see the list of users`)
      .setColor(0xff4747)
      await message.reply({embeds: [embed]}).catch(error => {})
      return
    }
  }
}
*/