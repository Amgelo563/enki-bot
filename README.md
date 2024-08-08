# 📚 Enki Bot

A powerful data-driven Discord bot for documenting resources and providing quick messages (tags), supporting categories, nested tags, resource/tag commands and more.

### Table of Contents
* [🔨 Usage](#-Usage)
    * [🏷 Tags](#-Tags)
        * [Tag Atlas File](#Tag-Atlas-File)
        * [Tag Files](#Tag-Files)
    * [📖 Resources](#-Resources)
        * [Resource Atlas File](#Resource-Atlas-File)
* [📁 Globs](#-Globs)
* [⌨ Schemas](#-Schemas)
    * [💬 Message Schema](#-Message-Schema)
    * [🤖 Command/Option Schema](#-CommandOption-Schema)
    * [🔍 Tag Reference Schema](#-tag-reference-schema)
* [⚙ Configuration](#-Configuration)
* [🚀 Running](#-Running)

## 🔨 Usage

Enki has two types of data: Tags and Resources. In this example we will be configuring Enki for a community where we offer products.

---

### 🏷 Tags

A **Tag** is a message (that can have content, embed and buttons) that is triggered by a command. They are loaded by **Tag Categories**, defined in the `content/tag-atlas.conf` file.

In Discord:
* The tag category is loaded as a command with an option to select the tag.
* Optionally, each tag inside the category can include an alias as a command.

> [!TIP]
> For example, you can have a tag category for frequently asked questions in your server, or another one for videos, each on their own command (`/faq <tag>` and `/video <tag>`, respectively).
> ![PlantUML Tags Diagram](http://www.plantuml.com/plantuml/dpng/TO-z3e8m54RtFiKL1oO67PqmleARORZ2PsaihRIt_iJmxW8kQk9uppqvoLT6uI2fiseXBJfGZP0is1K-YJKEola6bErPqrOinuoMWhjiRgqHq5CHNRW-inwT_CHzJfEvOu7suP7D0j6XJuXYl2jMrGzOJs3uobnD0_ydDFyAhZwluping1Ak6QUy0000)

#### Tag Atlas File

The **Tag Atlas** is an array of tag categories, each of which define the path, the category command, and what data to use while autocompleting.

`content/tag-atlas.conf`
```json5
[
  {
    // Glob array to match tags from this category, relative to current directory (config).
    // See the "Globs" section for more information about globs.
    tags: ["tags/faq/**.conf"],
    
    // Command to use to search for tags of this category.
    command: {
      // Command Schema with "tag" option, for the tag to search
    },
    
    // What data to use to fuzzy search for tags while autocompleting, apart from the tag's keywords.
    searchBy: {
      // Whether to search by the tag's content.
      content: true,
      // Whether to search by the tag's embeds titles and descriptions.
      embeds: true
    },
    
    // A message to show when this command is called without any tags or an invalid one.
    // Don't include it or set it to `false` if you don't need it.
    // ^ On that case, the tag option will be required, and any invalid tags will show an error.
    message: {
      // Message Schema with buttons
    }
  }
]
```

#### Tag Files

After defining a tag category, you can now create your tags inside the path you provided.

`content/tags/faq/my-question.conf`
```json5
{
  // What keywords the user can use to trigger this tag, requires at least one. Will also be used for autocompletion.
  // Only the first keyword will be shown for autocompletion, typing the others will show the first one.
  // WARN: The first keyword will be used as the tag's ID. While more than one tag can have the same "secondary" keywords,
  //       the ID must be unique.
  keywords: ["my-question"],
  
  // Optionally, define a command that will trigger this command (an alias of /<category> <this tag>).
  // Don't include it or set it to `false` if you don't need it.
  command: {
    // Command schema without options.
    name: "my-question",
    description: "Command that triggers the my-question tag."
  },
  
  message: {
    // Message schema with buttons.
  }
}
```

You can then use:
* `/faq my-question` - To trigger the "my-question" tag.
* `/my-question` - Same as above, thanks to the `command` property in `my-question.conf`.

---

### 📖 Resources

A **Resource** is an object that contains tags and tag categories. They are defined in the `content/resource-atlas.conf` file.

In Discord:
* Each resource is loaded as the main command.
    * "Direct" tags are loaded as subcommands.
    * Tag categories are loaded as subcommands (with an option to select the tag).
* Optionally, each tag inside a tag category can include an alias as a subcommand (in the main command).

> [!TIP]
> For example, you can have a "my-product" resource, letting you include videos, faqs, etc per product.
> ![PlantUML Resource diagram](http://www.plantuml.com/plantuml/png/TOozJiKm38NtF8K9GwSCC39Tn1iWDjJ196vlr2Hk4mUeKD-T_gW380PBnyV-laiHp59ZK3TofKXWATT0c0nN2JwHIkm8z3CLhjaIF4h0ek5Mw5CUFgvU2BuKG9TnXNKJPpDcTjLA0oUZzm-0LvywRe-ugeTov17jWFq6TpYL1bwmXoSKwZdF9xeIKwKYdfF1za_rTbJBBz-xTyJ_6_UpkMj_xlUdQvj5NIYv6iCt)

#### Resource Atlas File

The resource atlas is located in the `content/resources-atlas.conf` file. It contains an array of resources.

```json5
[
  {
    // The entry point for this resource's tags and tag categories.
    command: {
      name: "my-product",
      description: "Command that triggers the my-product resource."
    },

    // Glob pattern array for the tags of this resource, relative to current path.
    // Warn: Every tag included here must have a command specified, which will be used as a subcommand.
    tags: ["my-product/**.conf"],

    // Follows the same format as a tag atlas
    categories: [
      {
        // Relative to current path.
        tags: [
          "my-product/faq/**.conf"
        ],
        // While the option is called command, it'd actually be a subcommand inside the resource's command
        command: {
          // Command schema with option "tag"
        },
        searchBy: {
          content: true,
          embeds: true
        },
        message: {
          // Message Schema with buttons
        }
      }
    ]
  }
]
```

Now you can use:
* `/my-product <tag>` to query a tag from `config/resources/my-product`.
* `/my-product faq [tag]` to query a tag from `config/resources/my-product/faq`.

---

## 📁 Globs

"Globs" are patterns to match files using special syntax. The following characters are the most common special ones.

> [!TIP]
> You can view a [more detailed explanation here](https://www.npmjs.com/package/glob#glob-primer).
> For context there, Enki only uses the `{ absolute: true }` option.

* `*` Matches 0 or more characters in a single path portion. For instance, `faq/*.conf` matches all `.conf` files only in the `faq` folder, not recursively.
* `**` Same as above, but matches recursively.
* `!(pattern|pattern)` Matches anything that does not match any of the patterns provided. You can use it alongside another glob in the array to exclude files, for instance `["*.conf", "!*_ignore.conf"]` will match every file, except those ending in `_ignore.conf`.
* `?` Matches any 1 character. For instance, `faq/?.conf` will match `faq/A.conf`, `faq/B.conf`, etc; but not `faq/AB.conf` (because it has two characters).

---

## ⌨ Schemas
There are multiple formats Enki re-uses across its configuration. These are called "Schemas".

### 💬 Message Schema

The message schema is used when configuring what message will be sent to the user.

```json5
{
  // WARNING: Even though every option is optional, either content or embeds must be provided (you can't omit both).

  // The message content, optional.
  content: "Showing faqs",

  // The message embeds, optional.
  embeds: [{
    title: "My question",
    // etc
  }],

  // Array of file paths (not globs) to send those files alongside the message, optional.
  // These file paths can be:
  // - Relative to the current directory, if they start with ./ (e.g., "./relative/path/file.png").
  // - Absolute paths starting from root (folder containing src, README, etc), if they start with /
  //   (e.g., "/absolute/path/to/file.png").
  files: [
    "./relative/path/file.png",
    "/absolute/file.png"
  ],

  // The message buttons, optional.
  // WARNING: Not every message option will read buttons. Check the doc first.
  buttons: [
    {
      // Either "url", "tag" or "message" type. See next buttons for examples
      type: "url",
      // The button label.
      label: "Link 1",
      // The button's emoji, optional.
      emoji: "🔗", 
      // The button url.
      url: "https://example.com",
    },
    {
      type: "tag",
      label: "See related tag",
      emoji: "❓",
      // Tag reference schema, see the end to check all the available options.
      tag: {
        
      },
    },
    {
      type: "message",
      label: "See this other message",
      emoji: "👀",
      // Used internally, must be unique across messages of this button.
      id: "someMsg",
      message: {
        // Message schema without buttons
        content: "Other message content",
        embeds: [{
          title: "Other embed",
          // etc
        }]
      }
    }
  ],
  
  // Variants of this message that the querier can select manually, available for tag messages.
  // If specified, the "variant" option in config will be attached to the tag's options.
  // Can be used to select localized versions, change the answer depending on the user's software version, etc.
  // You can make use of HOCON's `include` syntax to create variants in other files.
  variants: {
    spanish: {
      // Message schema with buttons.
    },
  }
}
```

### 🤖 Command/Option Schema

The command schema is used when configuring sub/commands and their options.

```json5
{
  // The command's name.
  name: "my-command",
  
  // The command's description.
  description: "My command.",
  
  // Optional, localization data for Discord clients on a specific language.
  // See https://discord-api-types.dev/api/0.37.92/discord-api-types-rest/common/enum/Locale#Index for available locales.
  locale: {
    SpanishES: {
      name: "comando",
      description: "Mi comando."
    }
  },
  
  // The command's options. Some commands will have it, some don't.
  // The exact options also depend on the context.
  options: {
    someOption: {
      name: "option",
      description: "This option's description.",
      
      // Optional as well.
      locale: {
        SpanishES: {
          name: "nombre",
          description: "La descripción de esta opción."
        }
      }
    }
  }
}
```

### 🔍 Tag Reference Schema

The tag reference schema is used when "referring" to a tag somewhere and triggering its message. Currently only used for tag buttons.

> [!CAUTION]
> Tag references are checked on startup to see if the tag/category/resource exists. If it doesn't, an error will be thrown.
> This includes referring to a category message when the category doesn't have one configured.

> [!TIP]
> As a reminder:
> * A tag category and resource IDs are their command names.
> * A tag ID is its first keyword.

Currently available options:

#### Tag Atlas Tags

Triggering a category message.

```json5
{
  category: "my-category"
}
```

Triggering a tag from a category.

```json5
{
  category: "my-category",
  tag: "my-tag"
}
```

#### Resource Atlas Tags

Triggering a tag category message inside a resource.

```json5
{
  resource: "resource",
  category: "tag-category",
}
```

Triggering a tag from a resource.

```json5
{
  resource: "resource",
  tag: "my-tag"
}
```

Triggering a tag from a tag category inside a resource.

```json5
{
  resource: "resource",
  category: "tag-category",
  tag: "my-tag"
}
```

## ⚙ Configuration
The `config.conf` file lets you configure the behavior or messages of the bot.

```json5
{
  // Bot's token
  token: "TOKEN",

  // Defines where the atlases are.
  source: {
    // Either "local" or "git".
    type: "",

    // The folder where the tag and resource atlases are contained.
    // For "local" type, it's relative to the Enki root (where the package.json file is), and defaults to "content".
    // For "git" type, it's relative to the git repository root, doesn't default to anything, not specifying it loads them directly from root. 
    contentFolder: "content",

    // The following options are only available for the "git" type.

    // The url of the git repository. Must end in `.git`.
    gitUrl: "",

    // Optionally, the folder where repository clones will be stored. Defaults to __clone__.
    cloneFolder: "",
  },

  errors: {
    // Message schema that will be triggered when the user specifies an unknown tag.
    tagNotFound: {
      content: "Unknown tag."
    },

    // Message schema that will be shown to the user for general errors.
    generic: {
      content: "An error has happened, please contact an admin."
    }
  },

  options: {
    // Command option schema to select a variant, for tags that have it.
    variant: {
      name: "variant",
      description: "Select a specific variant of this tag."
    },
    // Command option schema to choose whether the output of the tag should be ephemeral, useful
    // to check what a tag contains before triggering it.
    hide: {
      name: "hide",
      description: "Whether to only show this tag to yourself."
    }
  }
}
```

## 🚀 Running

Enki requires at least Node.js 20.

1. Run `npm install` to install the dependencies.
2. Run `npm run build` to build the bot.
3. Fill your `config.conf` file and fill your atlases.
4. Run `npm run start` to start the bot.

Optionally, you can run `npm run start:parse` to only start the "parsing" part of the bot, which will only parse and assert your content, but not run the bot.
