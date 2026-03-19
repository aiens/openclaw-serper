# OpenClaw Serper Scholar Plugin

Google Scholar 学术搜索插件，为 OpenClaw 提供论文和学术文献检索能力。

> **Fork 说明：** 本仓库 fork 自 [fanzhidongyzby/openclaw-serper](https://github.com/fanzhidongyzby/openclaw-serper)，移除了 `serper_search`（已通过内置 `web_search` 供应商机制支持），仅保留独有的 `serper_scholar` 学术搜索工具。API Key 优先从 `openclaw.json` 配置读取，无需配置 `.env`，无需重启 Gateway。

## 功能

- **学术检索** — 通过 Google Scholar API 查找论文和学术文献
- **结构化结果** — 返回标题、作者、年份、引用次数、发表刊物等详细信息
- **多语言支持** — 支持中文、英文等多语言搜索
- **配置共享** — API Key 与桌面端 Web 搜索工具的 Serper 供应商配置共享

## 安装

```bash
openclaw plugins install https://github.com/aiens/openclaw-serper.git
openclaw gateway restart
```

## 配置

### 方式 1：桌面端配置（推荐）

在「工具 → Web 搜索」中选择 Serper 供应商并填写 API Key。`serper_scholar` 会自动共享该密钥，无需额外配置。

### 方式 2：环境变量

编辑 `~/.openclaw/.env`：

```bash
SERPER_API_KEY=your-api-key-here
```

### 获取 API Key

访问 [https://serper.dev/](https://serper.dev/) 注册并获取 API Key。

## 使用

```
你：搜索 Transformer 架构的相关论文
AI：[自动调用 serper_scholar]
```

### 参数

| 参数 | 类型 | 必选 | 默认值 | 说明 |
|------|------|------|--------|------|
| query | string | ✅ | — | 搜索关键词 |
| num | number | ❌ | 10 | 结果数量（最大 20） |
| gl | string | ❌ | cn | 国家代码 |
| hl | string | ❌ | zh-CN | 语言代码 |

### 返回字段

- `title` — 论文标题
- `url` — 论文链接
- `snippet` — 摘要
- `authors` — 作者列表
- `year` — 发表年份
- `citationCount` — 引用次数
- `publication` — 发表刊物/会议
- `type` — 文献类型

## 许可证

MIT License

## 致谢

- 原始仓库：[fanzhidongyzby/openclaw-serper](https://github.com/fanzhidongyzby/openclaw-serper)
- [Serper](https://serper.dev/) — Google Search API
- [OpenClaw](https://github.com/openclaw/openclaw)
