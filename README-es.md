# 📚 Enki Bot

**🇪🇸 Viendo en Español** / [🇺🇸 Read in English](README.md)

Un bot de Discord totalmente configurable para crear documentación, permitiendo crear mensajes rápidos (Tags), con soporte de categorías, mensajes anidados, búsqueda personalizable de tags, y más.

### Índice
* [🔨 Uso](#-uso)
    * [🏷 Tags](#-Tags)
        * [Archivo Tag Atlas](#Archivo-Tag-Atlas)
        * [Archivos de Tags](#Archivos-de-Tags)
    * [📖 Resources](#-Resources)
        * [Archivo Resource Atlas](#Archivo-Resource-Atlas)
* [📁 Globs](#-Globs)
* [⌨ Schemas](#-Schemas)
    * [💬 Schema de Mensaje](#-schema-de-mensaje)
    * [🤖 Schema de Comando](#-schema-de-comando)
    * [🔍 Schema de Referencia a Tag](#-schema-de-referencia-a-tag)
* [⚙ Configuración](#-configuración)
* [🚀 Iniciar el Bot](#-iniciar-el-bot)

## 🔨 Uso

Enki soporta dos tipos de información: Tags (Etiquetas) y Resources (Recursos).

> [!TIP]
> En este ejemplo configuraremos Enki para un servidor donde ofreces productos.
> Para este ejemplo, se asume que en `config.conf` el source type es `local` y el `contentFolder` es `content` (o no se especificó, ya que es el valor por defecto).

---

### 🏷 Tags

Un **Tag** (Etiqueta) es un mensaje que puede tener texto plano, embeds y/o botones, que es ejecutado por un comando. Son cargados por los **Tag Categories** (Categorías de etiquetas), las cuales son definidas en el archivo `tag-atlas.conf`.

En Discord:
* La Category es cargada como un comando con una opción para seleccionar el Tag (usando autocompletado).
* Opcionalmente, cada Tag dentro de la Category puede crear su propio comando, como un alias.

> [!TIP]
> Por ejemplo puedes crear una category para preguntas frecuentes del servidor y otra para videos, cada una con su propio comando (`/faq <tag>` y `/video <tag>`, respectivamente).
> ![PlantUML Tags Diagram](http://www.plantuml.com/plantuml/dpng/TO-z3e8m54RtFiKL1oO67PqmleARORZ2PsaihRIt_iJmxW8kQk9uppqvoLT6uI2fiseXBJfGZP0is1K-YJKEola6bErPqrOinuoMWhjiRgqHq5CHNRW-inwT_CHzJfEvOu7suP7D0j6XJuXYl2jMrGzOJs3uobnD0_ydDFyAhZwluping1Ak6QUy0000)

#### Archivo Tag Atlas

El **Tag Atlas** (Atlas de Tags) es una lista de Tag Categories, donde cada una define los tags, el comando de la Category, qué comando se debería usar para buscar tags, y más.

`content/tag-atlas.conf`
```json5
[
  {
    // Lista de Globs que corresponden a los tags de la Category, relativo a la carpeta actual.
    // Revisa la sección de "Globs" para más información sobre cómo crearlos.
    tags: ["tags/faq/**.conf"],
    
    // Comando a usar para crear tags de esta Category. El name es usado como ID de la Category
    command: {
      // Schema de Comando (con opción "tag", que corresponde al Tag a buscar).
      // Revisa la sección de Schemas para ver las opciones disponibles aquí.
    },
    
    // Define qué data puede usar el usuario para buscar tags en el autocompletado, aparte de las keywords del tag.
    searchBy: {
      // Si se puede buscar por el contenido en texto plano (content) del tag.
      content: true,
      // Si se puede buscar por el contenido de los embeds del tag.
      embeds: true
    },
    
    // Opcionalmente, el mensaje a usar cuando el comando se usa con un Tag inválido o no se especificó uno.
    // No lo incluyas o ponlo en `false` si no lo necesitas.
    // ^ En caso que hagas eso, la opción de "tag" será marcada como requerida, y usar un Tag inválido enviará el error definido en la config.
    message: {
      // Schema de Mensaje con Botones
      // Revisa la sección de Schemas para ver las opciones disponibles aquí.
    }
  }
]
```

#### Archivos de Tags

Tras definir la Tag Category, ahora puedes crear tus Tags dentro de los directorios que especificaste.

`content/tags/faq/mi-pregunta.conf`
```json5
{
  // Qué keywords (palabras clave) puede usar el usuario para usar este Tag. Al menos una es necesaria.
  // Solo la primera keyword será mostrada como tal en el autocompletado, el resto funcionan como aliases internos de buscado.
  // WARN: La primera keyword será usada como la ID del Tag. Aunque varios tags pueden tener las mismas keywords "secundarias",
  //       la ID debe de ser única.
  keywords: ["my-question"],
  
  // Opcionalmente, un comando alias que también sacará este Tag, aparte de poder usarlo dentro del comando de su Category.
  // Don't include it or set it to `false` if you don't need it.
  command: {
    // Schema de Comando (sin opciones).
    name: "mi-pregunta",
    description: "Comando que activará el tag mi-pregunta."
  },
  
  // El mensaje del tag.
  message: {
    // Schema de Mensaje con Botones.
  }
}
```

Con esta configuración, puedes usar:
* `/faq my-question` - Para usar el Tag "mi-pregunta".
* `/my-question` - Igual que arriba, gracias a la propiedad `command` en `mi-pregunta.conf`.

---

### 📖 Resources

Un **Resource** (Recurso) es un objeto que contiene Tags y Tag Categories. Son definidos en el archivo `resource-atlas.conf`.

En Discord:
* Cada recurso es cargado como un comando.
    * Los Tags "directos" del recurso son cargados como subcomandos.
    * Los Tag Categories son cargados como subcomandos, con una opción para seleccionar el tag.
* Opcionalmente, cada Tag dentro de una Tag Category puede incluir un alias como un subcomando, como si fuera un Tag directo del Resource.

> [!TIP]
> Por ejemplo, puedes tener un Resource "mi-producto" pudiendo incluir videos, faqs, un Tag de info, etc.
> ![PlantUML Resource diagram](http://www.plantuml.com/plantuml/png/TOozJiKm38NtF8K9GwSCC39Tn1iWDjJ196vlr2Hk4mUeKD-T_gW380PBnyV-laiHp59ZK3TofKXWATT0c0nN2JwHIkm8z3CLhjaIF4h0ek5Mw5CUFgvU2BuKG9TnXNKJPpDcTjLA0oUZzm-0LvywRe-ugeTov17jWFq6TpYL1bwmXoSKwZdF9xeIKwKYdfF1za_rTbJBBz-xTyJ_6_UpkMj_xlUdQvj5NIYv6iCt)

#### Archivo Resource Atlas

El **Resource Atlas** (Atlas de Recursos) es una lista de Resources, donde cada uno define sus Tags, Tag Categories y su comando.

```json5
[
  {
    // El comando principal del Resource.
    command: {
      // También usado como ID del Resource.
      name: "mi-producto",
      description: "Comando principal del Resource mi-producto."
    },

    // Lista de Globs que corresponden a los Tags de la Category, relativo a la carpeta actual.
    // Revisa la sección de "Globs" para más información sobre cómo crearlos.
    // WARN: Todos los tags incluidos aquí deben tener un comando (`command`) especificado, el cual será usado como su subcommando.
    tags: ["my-product/**.conf"],

    // Sigue el mismo formato que un Tag Atlas
    categories: [
      {
        // Relativo a la carpeta actual.
        tags: [
          "my-product/faq/**.conf"
        ],
        // Aunque la opción se llama "command", en este caso sería un subcomando
        command: {
          // Schema de Comando (con opción "tag", que corresponde al Tag a buscar).
          // Revisa la sección de Schemas para ver las opciones disponibles aquí.
        },
        searchBy: {
          content: true,
          embeds: true
        },
        // Opcional, al igual que en el Tag Atlas
        message: {
          // Schema de Mensaje con Botones
          // Revisa la sección de Schemas para ver las opciones disponibles aquí.
        }
      }
    ]
  }
]
```

Ahora puedes usar:
* `/my-product <tag>` para usar un Tag de `content/my-product`.
* `/my-product faq [tag]` para usar un Tag de `content/my-product/faq`.

---

## 📁 Globs

Los **Globs** son patrones para encontrar archivos usando una sintaxis especial. Aquí se especifica los usos más comunes.

> [!TIP]
> Puedes ver una [explicación más detallada aquí](https://www.npmjs.com/package/glob#glob-primer).
> Como contexto ahí, Enki solo usa la opción `{ absolute: true }`.

* `*` Coincide 0 o más caracteres en una sola porción de ruta. Por ejemplo, `faq/*.conf` coincide todos los archivos `.conf` solo en la carpeta `faq`, no de forma recursiva.
* `**` Lo mismo que arriba, pero de forma recursiva. (Coincidiría todos los `.conf` en `faq` y los que estén dentro de carpetas en `faq`).
* `!(glob|glob)` Excluye los archivos que coincidan con los globs proveídos. Puedes usarlo con otros patrones para excluir archivos anteriormente coincididos. Por ejemplo, `["*.conf", "!*_ignore.conf"]` coincidiría todos los archivos `.conf`, excepto los que terminen en `_ignore.conf`.
* `?` Coincide 1 caracter cualquiera. Por ejemplo, `faq/?.conf` coincidiría `faq/A.conf`, `faq/B.conf`, etc; pero no `faq/AB.conf`.

---

## ⌨ Schemas

Los **Schemas** son formatos que se utilizan frecuentemente en Enki.

### 💬 Schema de Mensaje

El Schema de Mensaje es usado para configurar mensajes que serán enviados a usuarios.

```json5
{
  // WARN: Aunque todas las opciones sean opcionales, todo mensaje tiene que contener o content o embeds (no se pueden omitir ambos, pero sí solo uno).

  // El contenido en texto plano del mensaje, opcional.
  content: "Viendo un mensaje",

  // Los embeds del mensaje, opcional.
  // Revisa https://discord.com/developers/docs/resources/message#embed-object-embed-limits para ver los límites de
  // caracteres en cada parte del embed.
  // Enki también revisará que todas las partes sean válidas, incluyendo la parte de "sum of characters".
  // Todas las partes son opcionales, excepto el title.
  embeds: [{
    title: "Título del embed",
    description: "Descripción del embed",
    url: "https://embed.url/",

    // https://www.iso.org/iso-8601-date-and-time-format.html
    timestamp: "2024-07-08",

    color: "#FFFFFF",
    footer: {
      text: "Texto del Footer",
      // Opcional
      icon: "https://footer-icon.url/",
    },
    image: "https://image.url/",
    thumbnail: "https://thumbnail.url/",
    author: {
      name: "Nombre del Autor",
      // Opcional
      url: "https://author.url/",
      // Opcional
      icon: "https://author-icon.url/",
    },
    fields: [
      {
        name: "Nombre del Field 1",
        value: "Valor del Field 1",
        // Opcional
        inline: false,
      },
      {
        name: "Nombre del Field 2",
        value: "Valor del Field 2",
      }
    ]
  }],

  // Lista de rutas (no globs) de archivos a ser enviados con el mensaje, opcional.
  // Estas rutas pueden ser:
  // - Relativas a la carpeta actual, si comienzan con ./ (por ejemplo, "./ruta/relativa/archivo.png").
  // - Absolutas (desde la carpeta que contiene src, README, etc), si comienzan con / (por ejemplo, "/ruta/absoluta/file.png").
  files: [
    "./ruta/relativa/archivo.png",
    "/ruta/absoluta/file.png"
  ],

  // Los botones del mensaje, opcional.
  // WARN: Solo algunos mensajes soportan botones, normalmente los que no están anidados. Revisa la documentación de cada uno.
  buttons: [
    {
      // Puede ser "url", "tag" o "message". Revisa los siguientes botones para ver ejemplos
      type: "url",
      // El texto del botón.
      label: "Link 1",
      // El emoji del botón, opcional.
      emoji: "🔗", 
      // La URL del botón.
      url: "https://example.com",
    },
    {
      type: "tag",
      label: "Ver un tag relacionado",
      emoji: "❓",
      // Schema de Referencia a Tag.
      tag: {
        
      },
    },
    {
      type: "message",
      label: "Mira este otro mensaje",
      emoji: "👀",
      // Usado internamente, debe ser único entre todos los mensajes (botones "message") de este botón.
      id: "unMensaje",
      message: {
        // Schema de Mensaje Sin Botones
        content: "Otro contenido de mensaje",
        embeds: [{
          title: "Otro embed",
          // etc
        }]
      }
    }
  ],
  
  // Variantes de este mensaje que el usuario puede seleccionar manualmente, disponible para mensajes de Tags.
  // Si se especifica, la opción "variant" de la config será puesta al comando del Tag o a su Category.
  // Puede ser usado para crear versiones en otros idiomas, o que dependan de la versión del usuario, etc.
  // Puedes usar la sintaxis de `include` de HOCON para crear variantes en otros archivos.
  variants: {
    english: {
      // Schema de Mensaje con Botones.
    },
  }
}
```

### 🤖 Schema de Comando

El Schema de Comando es usado para configura sub/comandos y sus opciones.

```json5
{
  // El nombre del comando.
  name: "mi-comando",
  
  // La descripción del comando.
  description: "Mi comando.",
  
  // Opcional, datos usados para clientes de Discord en un idioma en específico.
  // Revisa https://discord-api-types.dev/api/0.37.92/discord-api-types-rest/common/enum/Locale#Index para ver todos los idiomas disponibles.
  locale: {
    EnglishUS: {
      name: "my-command",
      description: "My command."
    }
  },
  
  // Las opciones del comando. Algunos las tienen, otros no, dependen del contexto y están documentados los que sí.
  options: {
    unaOpcion: {
      name: "opción",
      description: "La descripción de esta opción.",
      
      // Igual que el locale del comando, también opcional.
      locale: {
        EnglishUS: {
          name: "option",
          description: "This option's description."
        }
      }
    }
  }
}
```

### 🔍 Schema de Referencia a Tag

El Schema de Referencia a Tag es usado cuando se "refiere" a un Tag o su variante. Actualmente solo se usa para botones de tipo "tag".

> [!CAUTION]
> Las referencias son revisadas al iniciar para ver si el Tag/Category/Resource existe.
> Esto incluye referencias a Categorys (sin especificar un Tag) y la Category no tiene un mensaje configurado.

> [!TIP]
> Como recordatorio:
> * La ID de una Tag Category o un Resource son sus nombres de sus comandos.
> * La ID de un Tag es su primer keyword.

Opciones disponibles para referencias:

#### Tags del Tag Atlas

Referirse a un message de una Tag Category.

```json5
{
  category: "mi-categoría"
}
```

Referirse a un Tag de una Tag Category.

```json5
{
  category: "mi-categoría",
  tag: "mi-tag"
}
```

#### Tags del Resource Atlas

Referirse a un message de una Tag Category de un Resource.

```json5
{
  resource: "recurso",
  category: "tag-category",
}
```

Referirse a un Tag de un Resource.

```json5
{
  resource: "recurso",
  tag: "mi-tag"
}
```

Referirse a un Tag de una Tag Category de un Resource.

```json5
{
  resource: "recurso",
  category: "tag-category",
  tag: "mi-tag"
}
```

## ⚙ Configuración

El archivo `config.conf` te permite configurar el comportamiento o mensajes del bot.

```json5
{
  // Token del Bot.
  token: "TOKEN",

  // Si es que el bot debe actualizar sus comandos. Puedes establecerlo a `false` mientras testeas.
  updateCommands: true,
  
  // Define dónde están los atlases.
  source: {
    // Puede ser "local" o "git".
    type: "",
    
    // La carpeta donde los atlases se encuentran.
    // Con el type en "local", es relativo a la carpeta raíz (donde se encuentra el package.json), y por defecto es "content".
    // Con el type en "git", es relativo a la carpeta raíz del repositorio de git. No contiene un valor por defecto, si no se especifica se usa la misma carpeta raíz del repositorio. 
    contentFolder: "content",
    
    // Las siguientes opciones solo son usadas con el type en "git".
    
    // La URL del repositorio de git a clonar. Debe terminar en `.git`.
    gitUrl: "",
    
    // Opcionalmente, la carpeta donde los clones de repositorios se guardarán. Por defecto es "__clone__".
    cloneFolder: "",
  },
  
  // Contiene los mensajes de error.
  errors: {
    // Mensaje usado cuando el usuario especifica un Tag no existente. Puede incluir botones.
    tagNotFound: {
      content: "Tag desconocido."
    },
    
    // Mensaje para errores genéricos detectados por el bot. Puede incluir botones.
    generic: {
      content: "Ha ocurrido un error. Por favor contáctese con el administrador."
    }
  },
  
  // Contiene opciones para comandos.
  options: {
    // Schema de Opción de Comando para seleccionar una variante, solo usado para Tags que lo tengan.
    variant: {
      name: "variante",
      description: "Selecciona una variante de este tag."
    },
    // Schema de Opción de Comando para escoger si el mensaje del Tag debería ser mostrado solo para el que lo invoca.
    // Útil para cerciorarse del contenido de un Tag antes de mandarlo.
    hide: {
      name: "esconder",
      description: "Si es que se debería mostrar el contenido de este Tag solo para ti."
    }
  }
}
```

## 🚀 Iniciar el Bot

Enki requiere al menos Node.js 20.

1. Usa `npm install` para instalar las dependencias.
2. Usa `npm run build` para compilar el bot.
3. Rellena tu `config.conf`, tus atlases y tu contenido.
4. Usa `npm run start` para iniciar el bot.

Opcionalmente, puedes usar `npm run start:parse` para solo iniciar la fase de "parseo" del bot, es decir que solo se cargarán los archivos (asegurándose que sean válidos), pero no se iniciará el bot como tal.

