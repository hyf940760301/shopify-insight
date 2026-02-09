# Hedwig — Shopify Insight AI 技术方案文档

---

## 1. 系统概述

Hedwig（Shopify Insight AI）是一个基于 Next.js 全栈架构的 Shopify 店铺商业智能分析平台。系统通过自动化爬虫引擎采集目标店铺数据，经过多维度量化分析后，结合 Google Gemini 大模型生成结构化竞品分析报告。

整体技术架构遵循 **"采集 → 聚合 → 推理 → 呈现"** 四阶段流水线设计，前三个阶段运行在服务端（Next.js API Routes），最后一个阶段由客户端 React 应用完成交互式渲染。

---

## 2. 技术栈总览

### 2.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.6 | 全栈框架，提供 SSR、API Routes、Middleware |
| **React** | 19.2.3 | 前端 UI 框架 |
| **TypeScript** | ^5 | 全局类型安全 |
| **Tailwind CSS** | ^4 | 原子化样式系统 |

### 2.2 AI / 大模型

| 技术 | 用途 |
|------|------|
| **@google/generative-ai** | Google Gemini SDK（主报告生成），支持 gemini-3.0-pro / gemini-2.0-flash 等多模型自动切换 |
| **@google/genai** | Google GenAI SDK（竞品搜索），支持 Google Search Grounding 联网搜索能力 |

### 2.3 数据采集与解析

| 技术 | 用途 |
|------|------|
| **axios** | HTTP 客户端，用于调用 Shopify products.json API 和抓取店铺 HTML |
| **cheerio** | 服务端 HTML 解析库，提取 DOM 元素、meta 标签、社媒链接、技术栈特征等 |
| **turndown** | HTML → Markdown 转换器，将商品描述的 HTML 转为结构化 Markdown |

### 2.4 前端 UI / 可视化

| 技术 | 用途 |
|------|------|
| **recharts** | 数据可视化图表库（柱状图、饼图、折线图、雷达图） |
| **framer-motion** | 动画引擎（页面过渡、卡片动效、加载状态） |
| **lucide-react** | 图标库 |
| **radix-ui** | 无障碍基础 UI 组件（shadcn/ui 底层） |
| **react-markdown** | Markdown 渲染（AI 报告内容展示） |
| **class-variance-authority** + **tailwind-merge** | 组件样式变体管理 |

### 2.5 认证与安全

| 技术 | 用途 |
|------|------|
| **next-auth** | 身份认证框架，JWT Session 策略 |
| **bcryptjs** | 密码哈希加密 |
| **Next.js Middleware** | 路由级鉴权守卫 |

### 2.6 部署与运维

| 技术 | 用途 |
|------|------|
| **Docker** | 多阶段构建镜像（node:18-alpine），standalone 输出模式 |
| **docker-compose** | 容器编排，含健康检查与日志配置 |
| **/api/health** | 健康检查端点 |

---

## 3. 系统架构

```
┌───────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                       │
│                                                               │
│  Landing Page ──→ Login ──→ Dashboard (交互式分析面板)          │
│  page.tsx          login/     dashboard/page.tsx               │
│                    page.tsx   ├── 概览面板                      │
│                              ├── 数据可视化 (recharts)          │
│                              ├── AI 报告展示                    │
│                              ├── 竞品分析                      │
│                              └── 商品列表 (筛选/排序/搜索)       │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTP POST /api/analyze
                        │ HTTP POST /api/translate
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                     服务端 (Next.js API Routes)                │
│                                                               │
│  Middleware (鉴权守卫)                                          │
│  ├── /api/analyze   → 核心分析流水线                            │
│  ├── /api/translate → 商品描述翻译                              │
│  ├── /api/auth/*    → NextAuth 认证                            │
│  └── /api/health    → 健康检查                                  │
└───────────────────────┬───────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
┌──────────────┐ ┌────────────┐ ┌─────────────────┐
│ Shopify API  │ │  目标网站   │ │  Google Gemini   │
│ products.json│ │  HTML 页面  │ │  API             │
│ collections  │ │  robots.txt │ │  + Search        │
│              │ │  sitemap    │ │    Grounding     │
└──────────────┘ └────────────┘ └─────────────────┘
```

---

## 4. 核心模块设计

### 4.1 数据采集引擎 (`shopify-scraper.ts`)

采集引擎负责从目标 Shopify 店铺提取全量结构化数据，分为三个子流程：

#### 4.1.1 平台检测 (`detectStoreType`)

在数据采集前，系统首先识别目标网站的电商平台类型，避免对非 Shopify 站点执行无效操作。

**检测策略（多信号评分机制）：**

| 检测方式 | 说明 |
|---------|------|
| Shopify API 探测 | 请求 `/products.json?limit=1`，200 响应即确认 API 可用 |
| HTML 特征匹配 | 检测 8 项 Shopify 特征码（`Shopify.theme`、`cdn.shopify.com`、`shopify-section`、`/cart.js` 等） |
| 其他平台识别 | 支持识别 WooCommerce、Magento、BigCommerce、Squarespace、Wix、PrestaShop、OpenCart |

- Shopify 特征码命中 ≥ 5 → 高置信度
- 命中 ≥ 3 → 中置信度
- 非 Shopify 平台 → 返回具体平台名称和错误提示

#### 4.1.2 商品数据采集 (`fetchProducts`)

通过 Shopify 公开的 `products.json` REST API 分页抓取商品数据：

- **分页策略**：每页 250 条，最多 3 页（上限 750 个商品）
- **数据处理**：商品描述 HTML 通过 Turndown 转换为 Markdown，标签字段统一为数组格式
- **容错机制**：HTTP 404/401/403 分别返回不同错误信息

**采集的商品字段：**
- 基础信息：title、handle、vendor、product_type、tags
- 价格数据：variants[].price、variants[].compare_at_price
- 变体信息：variants[].option1/2/3、variants[].sku、variants[].available
- 视觉资源：images[].src、images[].alt、images[].width/height
- 时间线：published_at、created_at、updated_at
- 描述内容：body_html（转 Markdown）

#### 4.1.3 网站全维度分析 (`fetchAndAnalyzeHomepage`)

并行于商品采集，系统同时抓取并解析店铺首页 HTML，提取以下维度：

| 维度 | 采集内容 | 解析方式 |
|------|---------|---------|
| **StoreMeta** | title、description、favicon、logo、OG image、keywords | `<meta>` / `<title>` / `<link>` 标签解析 |
| **SocialLinks** | Facebook、Instagram、Twitter、YouTube、TikTok、Pinterest、LinkedIn | `<a>` 链接匹配 + 正则提取 |
| **TechAnalysis** | Shopify 主题、货币、语言、评价系统、搜索、购物车、Newsletter、在线客服、支付方式、第三方应用 | DOM 选择器 + HTML 关键词检测 |
| **SiteStructure** | 主导航、页脚链接、About/Contact/FAQ/Blog/退换货/运费政策页面 | 导航链接 + 路径关键词匹配 |
| **SEOAnalysis** | Meta Description、Title Tag、OG Tags、Twitter Cards、结构化数据、Canonical URL、robots.txt、sitemap.xml | `<meta>` / `<script>` 标签 + HEAD 请求 |

**第三方应用检测覆盖 20+ 工具：** Klaviyo、Judge.me、Loox、Yotpo、Stamped.io、Privy、Omnisend、Smile.io、Gorgias、Zendesk、Intercom、Hotjar、Google Analytics、Facebook Pixel、TikTok Pixel 等。

**支付方式检测：** Visa、Mastercard、American Express、PayPal、Apple Pay、Google Pay、Shop Pay、Klarna、Afterpay、Affirm。

---

### 4.2 数据聚合引擎 (`data-aggregator.ts`)

聚合引擎将原始爬虫数据转化为 20+ 维度的结构化分析指标，全部基于确定性算法计算，不依赖 AI。

#### 4.2.1 统计分析维度

| 分析模块 | 输出指标 |
|---------|---------|
| **价格统计** (PriceStats) | 均价、中位价、最低/最高价、标准差 |
| **标签词云** (TagCloud) | Top 25 标签及出现频率/占比 |
| **价格分布** (PriceDistribution) | 自适应分桶（根据最高价动态调整区间），每桶数量和占比 |
| **供应商分析** (VendorAnalysis) | 各供应商商品数、占比、均价、价格区间 |
| **产品分类** (ProductTypeAnalysis) | 各品类商品数、占比、均价 |
| **折扣分析** (DiscountAnalysis) | 折扣商品数/占比、平均折扣力度、最大折扣、折扣分布 |
| **变体分析** (VariantAnalysis) | 总 SKU 数、平均变体数、选项类型（颜色/尺码等）及值分布 |
| **图片分析** (ImageAnalysis) | 总图片数、平均图片数/商品、无图商品数、Alt 文本覆盖率 |
| **时间线分析** (TimelineAnalysis) | 最早/最新上架时间、月度上新频率、月均上新数 |
| **库存分析** (InventoryAnalysis) | 在售/缺货数量及占比 |

#### 4.2.2 商品明细增强 (ProductDetail)

每个商品在基础数据上扩展以下推断字段（规则驱动，非 AI）：

| 推断字段 | 逻辑 |
|---------|------|
| `price_tier` | 基于均价比值划分：budget (<0.5x)、mid-range (0.5-1.2x)、premium (1.2-2.5x)、luxury (>2.5x) |
| `target_audience` | 基于标签关键词 + 价格 + 品类推断目标客群 |
| `seasonality` | 基于标签/标题中的季节/节日关键词推断 |
| `key_features` | 基于描述中的材质/品质/功能关键词提取 |
| `competitive_position` | 基于价格/折扣/变体数综合判断（旗舰/主力/引流/入门款） |

#### 4.2.3 数据驱动评分体系 (StoreScores)

系统通过 31 项可量化指标计算三大维度评分，每项指标包含：权重、达标阈值、实际值、通过/未通过状态、改进建议。

**产品评分（10 项，基准 58 分）：**
商品数量、价格分层覆盖、描述完整度、图片丰富度、Alt 文本覆盖、变体丰富度、库存健康度、上新节奏、折扣策略合理性、品类覆盖

**运营评分（10 项，基准 52 分）：**
站内搜索、购物车、评价系统、About 页面、联系页面、FAQ、退换货政策、运费政策、在线客服、多支付方式

**营销评分（11 项，基准 48 分）：**
Meta Description、Title Tag、OG Tags、结构化数据、Sitemap、Newsletter、社交媒体覆盖、博客版块、多渠道深度布局、Twitter Cards、Canonical URL

#### 4.2.4 AI 上下文构造 (AIContext)

聚合引擎最终产出 `AIContext` 数据包，作为 Gemini 大模型的输入上下文：

- 店铺元数据 + 价格统计 + Top 15 标签
- Top 10 供应商 + Top 10 品类
- 折扣/变体/图片/时间线/库存分析
- 社交媒体/技术栈/网站结构/SEO 全量数据
- 网站健康评分
- 12 个代表性商品样本（等间距采样）

---

### 4.3 AI 分析引擎 (`gemini-client.ts`)

AI 引擎负责将结构化数据转化为商业洞察，采用"主报告 + 竞品搜索"并行双通道架构。

#### 4.3.1 模型策略

**主报告生成（多模型降级链）：**

```
gemini-3.0-pro → gemini-2.0-flash → gemini-1.5-flash-latest → gemini-1.5-flash-001 → gemini-pro
```

- 按优先级逐个尝试，模型不可用（404）自动跳转下一个
- `temperature: 0` 确保输出稳定性
- `maxOutputTokens: 8192` 保证报告完整性
- 输出格式：严格 JSON Schema，解析失败自动重试

**竞品搜索（Google Search Grounding）：**

```
gemini-2.0-flash → gemini-2.0-flash-001
```

- 通过 `@google/genai` SDK 的 `tools: [{ googleSearch: {} }]` 启用联网搜索
- 竞品数据分两组标注来源：`search_grounded`（搜索验证）和 `ai_inference`（AI 推理）
- 置信度分层：搜索验证 75-95，AI 推理 60-75

#### 4.3.2 并行执行架构

```typescript
const [mainReport, searchCompetitors] = await Promise.all([
  generateMainReport(context),           // 主报告（8 大模块）
  generateCompetitorWithSearch(context),  // 联网搜索竞品（独立通道）
]);
```

- 两个任务并行执行，互不阻塞
- 竞品搜索失败时自动降级，使用主报告中的 AI 推理竞品数据
- 搜索成功时，竞品模块替换为更高质量的搜索验证结果

#### 4.3.3 AI 报告输出结构 (AIReport)

| 模块 | 类型 | 说明 |
|------|------|------|
| **executiveSummary** | ExecutiveSummary | 一句话定位 + 4 个关键指标 + 综合评价 + 置信度 |
| **marketPosition** | MarketPosition | 细分市场、定价层级、竞争优势、市场趋势 |
| **userPersona** | UserPersona | 主要 + 次要两组完整用户画像（含人口统计/消费心理/购买旅程/数字行为/营销建议） |
| **productStrategy** | ProductStrategy | 定价策略分析 + 产品组合洞察 + 产品缺口分析 |
| **operationsAssessment** | OperationsAssessment | 运营优劣势 + Quick Wins 建议 |
| **marketingAnalysis** | MarketingAnalysis | 各渠道状态评估 + 内容策略 + 优化建议 |
| **swotAnalysis** | SWOTAnalysis | 优势/劣势/机会/威胁各 4+ 条 |
| **strategicRecommendations** | StrategicRecommendation[] | 至少 5 条按优先级排序的建议（标注影响力和实施难度） |
| **competitorAnalysis** | CompetitorAnalysis | 3-5 个真实竞品的完整对比分析 |

#### 4.3.4 Prompt 工程

主报告 Prompt 结构：

```
角色设定 → 店铺数据注入（9 个数据块）→ JSON Schema 定义 → 输出约束（12 条规则）
```

竞品搜索 Prompt 结构：

```
角色设定 → 店铺数据注入（精简版）→ 两组竞品要求定义 → JSON Schema → 置信度标注规则
```

关键约束：
- 所有分析必须基于提供的数据，有理有据
- 输出全部使用中文（除字段名和枚举值）
- 竞品分析标注数据来源和置信度，区分搜索验证与 AI 推理
- `temperature: 0` 消除随机性

---

### 4.4 翻译服务 (`/api/translate`)

独立的商品描述翻译端点，使用 Gemini 模型将英文产品描述翻译为中文电商文案。

- 与分析流水线相同的多模型降级策略
- Prompt 要求保持 Markdown 格式不变，翻译符合中文电商表达习惯

---

### 4.5 缓存系统 (`cache.ts`)

内存级 LRU 缓存，避免短时间内对同一店铺重复分析。

| 参数 | 值 | 说明 |
|------|------|------|
| TTL | 24 小时 | 过期自动失效 |
| 最大条目 | 50 | LRU 淘汰策略 |
| URL 归一化 | 协议/www/大小写/路径无关 | `gymshark.com`、`https://www.GYMSHARK.COM/` 映射到同一 key |

支持 `forceRefresh` 参数强制刷新缓存。响应中附带缓存元数据（是否命中、数据生成时间）。

---

### 4.6 认证与路由守卫

#### 认证方案

- **NextAuth.js**（Credentials Provider）
- **JWT Session** 策略，有效期 30 天
- 密码使用 **bcrypt** 哈希存储

#### 路由守卫（Middleware）

| 路由 | 访问控制 |
|------|---------|
| `/` | 公开（Landing Page） |
| `/login` | 公开 |
| `/api/auth/*` | 公开（NextAuth 端点） |
| `/api/health` | 公开（健康检查） |
| `/_next/*`、静态资源 | 公开 |
| `/dashboard` | 需要登录 |
| `/api/analyze` | 需要登录 |
| `/api/translate` | 需要登录 |

未登录用户访问受保护路由 → 重定向至首页。

---

## 5. 请求处理流水线

一次完整分析的请求流程：

```
客户端 POST /api/analyze { url: "gymshark.com" }
│
├─ 1. URL 校验 + 缓存查询
│     ├─ 缓存命中 → 直接返回（附缓存元数据）
│     └─ 缓存未命中 → 进入分析流水线
│
├─ 2. 平台检测 (detectStoreType)
│     ├─ 非 Shopify → 返回 400 + 平台信息
│     ├─ Shopify 但 API 禁用 → 返回 400 + 详细提示
│     └─ Shopify + API 可用 → 继续
│
├─ 3. 并行数据采集 (Promise.all)
│     ├─ fetchProducts()         → 最多 750 个商品
│     └─ fetchAndAnalyzeHomepage() → 网站全维度数据
│
├─ 4. 数据聚合 (aggregateData)
│     → 20+ 维度统计 + 31 项评分 + AI Context 构造
│
├─ 5. 并行 AI 生成 (Promise.all)
│     ├─ generateMainReport()           → 8 大模块结构化报告
│     └─ generateCompetitorWithSearch() → 联网搜索竞品分析
│
├─ 6. 结果合并 + 缓存写入
│
└─ 7. 返回 JSON 响应
```

---

## 6. 前端架构

### 6.1 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| Landing Page | `/` | 品牌入口，含 URL 输入框和快速分析入口 |
| Login Page | `/login` | 登录页面 |
| Dashboard | `/dashboard` | 核心分析面板，展示所有分析结果 |

### 6.2 Dashboard 功能模块

Dashboard 页面（~2100 行）是整个前端的核心，包含以下交互式模块：

| 模块 | 可视化组件 | 数据来源 |
|------|-----------|---------|
| 概览面板 | 数字卡片 + 评分环 | 聚合数据 stats |
| 综合评分 | 雷达图 + 评分明细展开面板 | store_scores |
| 价格分布 | 柱状图 | price_distribution |
| 标签词云 | 横向柱状图 | tag_cloud |
| 供应商矩阵 | 饼图 + 表格 | vendor_analysis |
| 折扣分析 | 柱状图 | discount_analysis |
| 上新时间线 | 折线图 | timeline_analysis |
| AI 报告 | Markdown 渲染 + 结构化卡片 | AIReport 9 大模块 |
| 竞品分析 | 对比卡片 + 置信度标签 | competitorAnalysis |
| 商品列表 | 虚拟滚动表格 + 搜索/筛选/排序 | all_products |
| 商品详情 | 模态面板（图片/变体/描述/翻译） | ProductDetail |

### 6.3 UI 技术特点

- **动画系统**：framer-motion 驱动页面过渡、卡片入场、Tab 切换、加载状态
- **响应式设计**：Tailwind CSS 断点适配桌面/平板/移动端
- **主题**：深色系视觉风格（`#0a0a0b` 基底），标题渐变动画
- **字体**：Geist Sans + Geist Mono（Google Fonts）

---

## 7. 部署方案

### 7.1 Docker 部署

采用多阶段构建优化镜像体积：

```
Stage 1 (deps)    → 安装依赖
Stage 2 (builder) → 编译构建（standalone 输出）
Stage 3 (runner)  → 仅复制运行时必要文件，非 root 用户运行
```

基础镜像：`node:18-alpine`

### 7.2 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `GEMINI_API_KEY` | 是 | Google Gemini API Key |
| `NEXTAUTH_SECRET` | 是 | NextAuth Session 加密密钥 |
| `NEXTAUTH_URL` | 生产环境 | 应用对外访问 URL |
| `NODE_ENV` | 否 | 运行环境（production / development） |
| `PORT` | 否 | 服务端口，默认 3000 |

### 7.3 健康检查

- 端点：`GET /api/health`
- 返回：`{ status, timestamp, version, environment }`
- Docker Compose 配置 30 秒检查间隔

---

## 8. 错误处理与容错机制

| 场景 | 处理策略 |
|------|---------|
| 非 Shopify 平台 | 返回检测到的具体平台名称 + 检测指标列表 |
| Shopify API 被禁用 | 返回详细提示（确认是 Shopify 但 API 不可用） |
| 商品数据为空 | 抛出明确错误信息 |
| Gemini 模型不可用 | 自动切换下一模型（最多 5 个备选） |
| Gemini API Key 无效 / 配额耗尽 / 频率超限 | 分别返回对应错误码和中文提示 |
| AI 输出格式异常 | JSON 解析失败时抛出重试提示 |
| 竞品搜索失败 | 不影响主报告，降级使用 AI 推理竞品 |
| 请求超时 | 返回 504 + 中文提示 |
| 安全策略拦截 | 返回提示，建议尝试其他店铺 |

---

## 9. 数据流全景图

```
                          Shopify Store
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
          products.json    Homepage HTML   robots/sitemap
                 │             │             │
                 ▼             ▼             ▼
         ┌───────────────────────────────────────┐
         │         shopify-scraper.ts             │
         │  ScraperResult {                       │
         │    products[], meta, socialLinks,       │
         │    techAnalysis, siteStructure,         │
         │    seoAnalysis, rawHtml                │
         │  }                                     │
         └──────────────────┬────────────────────┘
                            │
                            ▼
         ┌───────────────────────────────────────┐
         │         data-aggregator.ts             │
         │  AggregatedData {                      │
         │    stats, tag_cloud, price_distribution,│
         │    vendor_analysis, discount_analysis,  │
         │    variant_analysis, image_analysis,    │
         │    timeline_analysis, inventory_analysis,│
         │    website_health, store_scores,        │
         │    all_products[], ai_context           │
         │  }                                     │
         └─────────────┬─────────┬───────────────┘
                       │         │
            ┌──────────┘         └──────────┐
            ▼                               ▼
  ┌────────────────────┐      ┌──────────────────────┐
  │  Gemini 主报告生成   │      │  Gemini + 联网搜索     │
  │  (8 大分析模块)      │      │  (竞品对比分析)        │
  │  gemini-3.0-pro     │      │  gemini-2.0-flash     │
  │  temperature: 0     │      │  Google Search        │
  │  JSON Schema 输出    │      │  Grounding           │
  └─────────┬──────────┘      └──────────┬───────────┘
            │                             │
            └──────────┬──────────────────┘
                       ▼
            ┌─────────────────────┐
            │    AIReport          │
            │    (9 大模块合并)     │
            └─────────┬───────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │  API Response JSON   │
            │  → 内存缓存 (LRU)    │
            │  → 前端 Dashboard    │
            └─────────────────────┘
```

---

*最后更新：2026-02-07*
