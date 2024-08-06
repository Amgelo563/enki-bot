// https://discord.com/developers/docs/resources/channel#embed-object-embed-limits
export const MessageEmbedLimits = {
  Title: 256,
  Description: 4096,
  Fields: {
    Amount: 25,
    Name: 256,
    Value: 1024,
  },
  FooterText: 2048,
  AuthorName: 256,

  Combined: 6000,
};
