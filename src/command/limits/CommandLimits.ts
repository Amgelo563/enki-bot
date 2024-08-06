// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
export const CommandLimits = {
  Amount: 100,

  Name: 32,
  // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming
  NameRegex: /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,

  Description: 100,
  Option: {
    Amount: 25,
    Name: 32,
    Description: 100,
  },

  // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure
  Autocomplete: {
    Amount: 25,
    Name: 100,
    Value: 100,
  },
};
