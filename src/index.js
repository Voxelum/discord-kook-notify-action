const core = require("@actions/core");
const { request } = require("undici");

let version = core.getInput("version");
version = version.startsWith("v") ? version.substring(1) : version;

async function generateZH() {
  const changelogs = await (
    await request(
      `https://raw.githubusercontent.com/voxelum/xmcl-page/master/src/pages/zh/changelogs/${version}.md`
    )
  ).body.text();

  let lines = changelogs.split("\n");
  lines = lines.slice(lines.lastIndexOf("---") + 1);

  const features = [];
  const fixes = [];
  const refactors = [];

  let current = undefined;
  for (const line of lines) {
    if (line.startsWith("###") && line.indexOf("特性") !== -1) {
      current = features;
    } else if (line.startsWith("###") && line.indexOf("修复") !== -1) {
      current = fixes;
    } else if (line.startsWith("###") && line.indexOf("重构") !== -1) {
      current = refactors;
    } else {
      if (current && line.length > 0) {
        current.push(line);
      }
    }
  }

  const sendKook = async () => {
    const sections = [];
    if (features.length > 0) {
      sections.push({
        type: "section",
        text: {
          type: "kmarkdown",
          content: ["🐛 **新特性**", ...features].join("\n"),
        },
      });
    }
    if (fixes.length > 0) {
      sections.push({
        type: "section",
        text: {
          type: "kmarkdown",
          content: ["🐛 **修复和补丁**", ...fixes].join("\n"),
        },
      });
    }
    if (refactors.length > 0) {
      sections.push({
        type: "section",
        text: {
          type: "kmarkdown",
          content: ["🏗️ **重构**", ...refactors].join("\n"),
        },
      });
    }
    const content = [
      {
        type: "card",
        theme: "info",
        size: "lg",
        modules: [
          {
            type: "header",
            text: {
              type: "plain-text",
              content: `${version} 发布`,
            },
          },
          ...sections,
          {
            type: "action-group",
            elements: [
              {
                type: "button",
                theme: "primary",
                value: "https://xmcl.app",
                click: "link",
                text: {
                  type: "plain-text",
                  content: "去官网下载",
                },
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "plain-text",
                content: "本消息由 Github Action 自动发布",
              },
            ],
          },
        ],
      },
    ];

    console.log(`Send kook message`);
    console.log(content);

    const response = await request(
      "https://www.kookapp.cn/api/v3/message/create",
      {
        method: "POST",
        body: JSON.stringify({
          type: 10,
          target_id: "9742373943819237",
          content: JSON.stringify(content),
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${core.getInput("token")}`,
        },
      }
    );
    console.log("kook response: " + response.statusCode);
    const body = await response.body.text();
    console.log(body);
  };

  const sendQQ = async () => {
    const clean = (line) => {
      const i = line.indexOf("(");
      if (i !== -1) {
        return line.substring(0, line.indexOf("(")).trim();
      }
      return line.trim();
    };

    let remaining = 600

    const lines = [
      `${version} 发布！请在应用内或官网 https://xmcl.app 下载新版本`,
    ];

    remaining -= (lines[0].length + 43 /* end line */ + 1 /* \n */)

    const pending = []

    if (features.length > 0) {
      pending.push("🚀 特性", ...features.map(clean).slice(0, 5));
    }

    if (fixes.length > 0) {
      pending.push("🐛 修复", ...fixes.map(clean).slice(0, 5));
    }

    if (refactors.length > 0) {
      pending.push("🏗️ 重构", ...refactors.map(clean).slice(0, 5));
    }

    for (const line of pending) {
      const length = line.length + 1
      if (remaining - length >= 0) {
        lines.push(line)
        remaining -= length
      } else {
        break
      }
    }

    lines.push("可以去 https://xmcl.app/zh/changelogs 查看完整更新日志");

    await request(
      `https://xmcl-notification-bot.azurewebsites.net/api/HttpTriggerJava1`,
      {
        method: "POST",
        body: lines.join("\n"),
      }
    );
  };

  sendKook();
  sendQQ();
}

async function generateEN() {
  const changelogs = await (
    await request(
      `https://raw.githubusercontent.com/voxelum/xmcl-page/master/src/pages/en/changelogs/${version}.md`
    )
  ).body.text();

  const lines = changelogs.split("\n");

  const features = [];
  const fixes = [];
  const refactors = [];

  let current = undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "### 🐛 Bug Fixes & Patches") {
      current = fixes;
    } else if (line === "### 🏗️ Refactors") {
      current = refactors;
    } else if (line === "### 🚀 Features") {
      current = features;
    } else {
      if (current) {
        current.push(line);
      }
    }
  }

  const fields = [];
  if (features.length > 0) {
    fields.push({
      name: "**🚀 Features**",
      value: features.join("\n"),
    });
  }
  if (fixes.length > 0) {
    fields.push({
      name: "**🐛 Bug Fixes & Patches**",
      value: fixes.join("\n"),
    });
  }
  if (refactors.length > 0) {
    fields.push({
      name: "**🏗️ Refactors**",
      value: refactors.join("\n"),
    });
  }

  const embeds = [
    {
      color: 2021216,
      title: `v${version}`,
      url: `https://github.com/voxlum/x-minecraft-launcher/releases/${version}`,
      description:
        "👋 Please download new version from [our website](https://xmcl.app).",
      fields: fields,
      footer: {
        text: "This action is auto generated by github actions",
        icon_url:
          "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      },
    },
  ];

  const payload = {
    username: "Github",
    embeds,
  };

  console.log("send discord");
  console.log(payload);
  const response = await request(core.getInput("discord"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log("discord response: " + response.statusCode);
  console.log(await response.body.text());
}

generateZH();
generateEN();
