// https://discord.com/developers/docs/resources/channel#create-message-jsonform-params
export const MessageLimits = {
  Content: 20000,
  Embeds: 10,
  // Undocumented, but should be 10 iirc (I don't think anyone would ever use more than 10 files either way)
  Files: 10,
};
