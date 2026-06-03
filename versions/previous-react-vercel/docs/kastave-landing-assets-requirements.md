# Kastave 独立站素材重制需求文档

更新时间：2026-05-31  
用途：首页、订金页、广告素材、Kickstarter 预热、Facebook/Reddit 早期用户内容  
目标：让访问者快速理解 Kastave 是“岸钓无人扫描船”，愿意留下邮箱并支付 `$1` founder reservation。

## 1. 总目标

这批素材需要统一服务三个转化动作：

1. 让用户相信 Kastave 能解决岸钓信息不足的问题。
2. 让用户看懂核心功能：自动扫描、3D 水下重建、AI 推荐 3 个抛投点、无感记录私密钓点。
3. 让用户愿意进入 `$1` 预订流程，理解 `$699` 划线后限时 `$599` founder price，并知道这是预订金，不是整机全款。

## 2. 视觉基调

整体方向：

- 真实户外岸钓场景，阳光明媚，湖泊/水库/河岸环境。
- 产品外观必须与 Kastave 黑色双体无人船一致：黑色船体、橄榄绿色侧面点缀、橙色电源键、前方白色灯带。
- 页面素材要像真实产品宣传，不要像概念科幻海报。
- UI 叠加可以有科技感，但必须服务信息表达，不能遮挡产品主体。
- 画面文字尽量少，核心文字由网页 HTML 承担，图片主要负责“场景 + 功能证明”。

禁止方向：

- 不要生成与产品外观不一致的白色机器人、圆形声呐球、多余船只。
- 不要让无人船看起来像玩具快艇或大型船。
- 不要出现夸张海浪、深海、海钓船队等偏离岸钓场景的画面。
- 不要伪造真实用户评价、真实 Reddit/Facebook 截图或虚假媒体背书。

## 3. 通用交付规格

### 当前独立站板块适配尺寸

以下尺寸按当前 Kastave 独立站代码里的真实板块比例整理，设计素材优先按这一张表交付。

| 页面板块 | 当前页面显示规则 | 推荐源文件尺寸 | 必交导出尺寸 | 安全区与裁切要求 |
|---|---|---:|---:|---|
| 首页 Hero 背景 | 全屏背景，`object-fit: cover`，焦点在 `64% 50%` | 2400×1600 | 2400×1350、1080×1350 | 产品放中右；左侧 40% 留给标题/表单；移动端顶部裁切仍能看到产品 |
| Deposit Hero 价格页 | 满宽背景，高度 `560-720px`，移动端 `640px`，圆角底部 | 2400×1600 | 2400×1350、1080×1350 | 中央上方留价格文字；产品放右侧 50%-85%；不要把产品主体放在按钮下 |
| Deposit 价格卡叠加图 | HTML 价格层：`$699` 划线、`$599`、`Ends in 3 days` | 不建议做死在图片里 | 透明辅助元素可 1200×700 | 价格优先由网页代码显示；图片只做背景，不要重复写价格 |
| Highlights 大卡 | CSS 比例 `1068 / 507`，圆角 60px | 2136×1014 | 1602×762、1068×507 | 文字在顶部中间；主体放中下；边缘保留 8% |
| Highlights 小卡 | CSS 比例 `528 / 507`，接近方图，圆角 60px | 1584×1521 | 1056×1014、528×507 | 主体居中；顶部留标题区域；移动端会统一裁为 `358/259` |
| 目标用户卡片 | CSS 比例 `1.22:1`，宽度 `320-520px` 自适应 | 1464×1200 | 1220×1000、732×600 | 卡片自动横向滚动；人物和产品不要贴边；可叠加动效层 |
| App UI 模块大图 | 右侧圆角矩形，最小高 `420-620px` | 1600×1200 | 1440×1080、1200×900 | 适合放手机界面或 App 场景；右侧展示区可横向裁切 |
| App 手机界面 | 页面中作为手机 mockup/视频素材使用 | 1170×2532 | 390×844、1080×1920 | iPhone 比例；文字至少 32px 等效可读 |
| Specs 产品参数 Hero | 宽图，高度 `520-680px`，产品图右侧 `76%` 宽 | 2400×1350 | 1920×1080、2400×1350 | 左侧 40% 留大标题；右侧放产品大图；参数图标由网页排版 |
| Privacy 私密钓点模块 | 页面内 App mockup 宽 `760px`，手机壳最小高 `420px` | 1170×2532 | 760×1200、1170×2532 | 展示私密 waypoint、保存记录、Private by default |
| Reservation 产品包模块 | 左图高度 `560-760px`，右侧文字卡片 | 1800×2200 | 1200×1500、1600×2000 | 竖图更适配；产品放中下，顶部不要空太多 |
| Footer 背景 | 满屏背景，最小高接近 `760px/92vh` | 2400×1600 | 2400×1350、1080×1350 | 中左留 Logo/表单，右侧可放产品或场景 |

当前最先要重做的 8 个素材：

| 优先级 | 素材 | 对应板块 | 必交尺寸 |
|---|---|---|---|
| P0 | Deposit 限时折扣背景图 | `/deposit` Hero | 2400×1350、1080×1350 |
| P0 | 首页 Hero 产品主图 | 首页 Hero | 2400×1350、1080×1350 |
| P0 | 3D 水下重建 + 三个抛投点 | Highlights 大卡 + App UI | 2136×1014、1170×2532 |
| P0 | 自动扫描界面 | App UI 模块 | 1440×1080、1170×2532 |
| P0 | AI 推荐三点图 | Highlights 小卡 | 1056×1014 |
| P1 | 水文信息感知图 | Highlights 小卡 | 1056×1014 |
| P1 | 私密钓点保存图 | Privacy 模块 | 1170×2532、760×1200 |
| P1 | 产品参数主图 | Specs 模块 | 2400×1350、1920×1080 |

### 图片

下面是通用备用尺寸；如果与上面的当前板块尺寸冲突，以上面的板块尺寸为准。

| 用途 | 主尺寸 | 备用尺寸 | 格式 | 备注 |
|---|---:|---:|---|---|
| 首页 Hero 背景 | 2400×1350 | 1920×1080 | JPG/WebP | 16:9，主体右侧或中右，左侧留文案空间 |
| 首页亮点 Bento 大图 | 1600×1000 | 1200×750 | JPG/WebP | 圆角卡片使用，主体居中，边缘留 8% 安全区 |
| 首页亮点 Bento 小图 | 1200×900 | 1000×750 | JPG/WebP | 4:3 或 3:2，适合裁切 |
| 目标用户卡片图 | 1400×1000 | 1200×900 | JPG/WebP | 横向卡片，可做自动轮播 |
| 产品主图/透明抠图 | 2000×2000 | 1600×1600 | PNG/WebP | 透明背景，产品边缘干净 |
| 参数图背景 | 2400×1350 | 1920×1080 | JPG/WebP | 可放产品大图和参数图标 |
| 社媒方图 | 1080×1080 | 1200×1200 | JPG/PNG | Facebook/Reddit/广告测试 |
| 社媒竖图 | 1080×1350 | 1440×1800 | JPG/PNG | Instagram/Facebook feed |
| 短视频封面 | 1080×1920 | 1920×1080 | JPG/PNG | 9:16 和 16:9 各一版 |

### 视频

| 用途 | 主尺寸 | 备用尺寸 | 时长 | 帧率 | 格式 |
|---|---:|---:|---:|---:|---|
| 首页功能短视频 | 1920×1080 | 1080×1920 | 6-12 秒 | 24/30 fps | MP4 H.264 |
| 广告短视频 | 1080×1920 | 1080×1080 | 10-20 秒 | 30 fps | MP4 H.264 |
| UGC 风格视频 | 1080×1920 | 1920×1080 | 15-45 秒 | 30 fps | MP4 H.264 |
| 参数/速度演示 | 1920×1080 | 1080×1350 | 8-15 秒 | 30 fps | MP4 H.264 |

视频安全区：

- 9:16 视频：顶部和底部各留 180 px，避免被平台 UI 遮挡。
- 16:9 视频：左右各留 120 px，底部留 100 px，避免字幕和按钮遮挡。
- 画面中不要内嵌太多文字，最多保留 1 个功能标签和 1 个关键数据。

文件命名：

```text
kastave_[category]_[scene]_[ratio]_[version].jpg
kastave_app_3d-cast-calls_9x16_v01.mp4
kastave_product_specs_16x9_v01.png
```

## 4. 素材一：软件 App 界面

目标：让用户相信 Kastave 不是单纯遥控船，而是“扫描 + 建模 + 推荐抛投点”的岸钓决策工具。

### 4.1 App UI 基础规格

设计画布：

- iPhone 视觉稿：390×844 px，适配 iPhone 15/16 视觉比例。
- 高清导出：1170×2532 px，3 倍图。
- 视频中手机界面：1080×1920 px，可直接套入手机 mockup。
- 网页展示 mockup：1200×1600 px，透明 PNG 或 WebP。

视觉要求：

- 深色地图底色，强调水下结构和路线。
- 主色：黑色/深蓝绿色背景，橙色用于 Kastave 船、推荐点、CTA，青绿色用于扫描路径和水下等深线。
- UI 要像真实钓鱼工具，不要像游戏界面。
- 英文界面优先，面向美国钓鱼用户。

### 4.2 页面 A：3D 建模 + 三种抛投点

页面目标：展示 3D 水下重建，并清晰标出 AI 推荐的 3 个点。

核心内容：

- 3D underwater terrain / depth contour。
- 岸边位置和 Kastave 扫描轨迹。
- 三个 AI cast calls：
  - Safe Cast：绿色点，低风险，适合先试。
  - Structure Cast：蓝色点，靠近坎、石头、草边、drop-off。
  - Risk / Reward Cast：橙红色点，高风险高收益。
- 底部显示简短解释：`AI recommends 3 casts from this scan.`

交付：

- 静态 UI 图：1170×2532 PNG。
- 手机 mockup 图：1400×1800 PNG，透明背景。
- 9:16 动效视频：1080×1920，6-8 秒。
- 16:9 网页视频：1920×1080，6-8 秒。

动效脚本：

1. 水面地图淡入。
2. 扫描线从 Kastave 船体向前推进。
3. 水下 3D 地形网格逐层生成。
4. 三个推荐点依次弹出：Safe / Structure / Risk-Reward。
5. 结束帧停留 2 秒，方便网页循环播放。

### 4.3 页面 B：三种模式

页面目标：展示 Kastave 有自动模式、静音模式、性能模式。

模式内容：

| 模式 | 英文名称 | 核心表达 | UI 状态 |
|---|---|---|---|
| 自动模式 | Auto Mode | One tap shoreline scan | 默认高亮 |
| 静音模式 | Silent Mode | Quiet pass near fish | 文字说明即可 |
| 性能模式 | Performance Mode | Faster sweep for more bank | 文字说明即可 |

交付：

- App 模式选择界面：1170×2532 PNG。
- 网页模块图：1600×1000 JPG/WebP。
- 9:16 动效视频：1080×1920，6-8 秒。

动效脚本：

1. 用户打开 App，Auto Mode 默认高亮。
2. 点击 `Start Scan`。
3. 模式说明卡片显示：
   - Auto：scan route + cast calls
   - Silent：low wake / quiet pass
   - Performance：fast bank coverage
4. 不需要展示复杂遥控杆，核心是“一键启动”。

### 4.4 页面 C：控制无人船自动扫描界面

页面目标：说明用户不需要反复抛投声呐，Kastave 自动沿岸扫描。

核心内容：

- 手机地图显示岸线。
- Kastave 船图标位于水面。
- 扫描路径为青绿色曲线。
- 顶部状态：`Auto Scan Running`
- 关键数据：
  - Coverage %
  - Depth range
  - Water temp
  - Battery
  - Return path

交付：

- App UI 静态图：1170×2532 PNG。
- 第一视角场景图：1600×1000 JPG/WebP，用户手持 iPhone，看着 Kastave 自动前进。
- 动效视频：9:16 和 16:9 各一版。

动效脚本：

1. 手指点击 `Start Scan`。
2. Kastave 从岸边缓慢向前走。
3. App 上路径自动绘制，Coverage 从 0% 到 68%。
4. 画面保留真实水面和产品运动轨迹。

### 4.5 页面 D：一键记录钓点

页面目标：展示 Kastave 可以无感记录私密钓点，强调 “Your spots stay yours”。

核心内容：

- 地图上显示私密 waypoint。
- 用户可以保存：
  - Drop-off
  - Weed edge
  - Rock pile
  - Bait activity
  - Good cast
- 记录内容：
  - 时间
  - 水温
  - 深度
  - 抛投点类型
  - 备注
- 隐私标签：`Private by default`

交付：

- App UI 静态图：1170×2532 PNG。
- 网页隐私模块图：1600×1000 JPG/WebP。
- 9:16 动效视频：6 秒。

动效脚本：

1. 用户钓到鱼或看到好点。
2. 点击 `Save Spot`。
3. 弹出 waypoint 卡片：`Private waypoint saved`。
4. 地图上出现一个私密图钉。

## 5. 素材二：产品主图与功能图

目标：让用户一眼看懂 Kastave 的产品形态和 5 个核心功能。

### 5.1 产品主图

内容要求：

- 产品在真实湖边或浅水边缘。
- 船体角度为 3/4 前视，能看到双体结构、提手、侧面推进/传感器区域。
- 产品不能太小，至少占画面宽度 35%-50%。
- 可加入轻微水波、灯带、扫描光束，但不要遮挡外观。

交付：

- Hero 主图：2400×1350 JPG/WebP。
- 产品详情图：2400×1350 JPG/WebP。
- 透明产品抠图：2000×2000 PNG/WebP。
- 社媒方图：1080×1080 JPG。

### 5.2 功能图 A：自动扫描，一键开启

画面：

- 用户站在岸边，手持手机。
- Kastave 在水面启动扫描。
- 水面上有简洁路径线，表达自动巡航。

文案建议：

- `One tap. Scout the bank.`
- `Auto-scan reachable water.`

尺寸：

- 网页图：1600×1000。
- 视频封面：1920×1080。
- 竖版广告：1080×1920。

### 5.3 功能图 B：3D 重建

画面：

- 上半部分是真实水面。
- 下半部分为半透明水下切面，显示石头、草、drop-off、深浅变化。
- Kastave 正在扫描，声呐扇形向下。

文案建议：

- `See the bottom before you cast.`
- `Build a 3D read of the water.`

尺寸：

- 首页 Bento 大图：1600×1000。
- 16:9 视频：1920×1080。

### 5.4 功能图 C：AI 推荐

画面：

- 手机 App 或水面叠加显示 3 个点。
- 绿色 Safe，蓝色 Structure，橙红色 Risk / Reward。
- 画面要明确“AI 分析后给出建议”，不要只像普通地图标记。

文案建议：

- `AI picks 3 cast calls.`
- `Safe. Structure. Risk / Reward.`

尺寸：

- 首页 Bento 小图：1200×900。
- App mockup：1170×2532。
- 视频：1080×1920。

### 5.5 功能图 D：水文信息感知

画面：

- Kastave 在近岸扫描。
- UI 叠加显示水温、深度、浑浊度/clarity、底质、草区、鱼情线索。
- 信息要看起来像仪表，不要像科幻 HUD。

建议字段：

- Depth
- Water temp
- Bottom hardness
- Weed edge
- Bait activity
- Clarity

尺寸：

- 首页 Bento 图：1200×900。
- 参数图局部：2400×1350。

### 5.6 功能图 E：无感记录，个人记录

画面：

- 手机 App 地图保存多个私密点。
- 用户在岸边收竿或查看历史记录。
- 强调 private log，不做公开 spot feed。

文案建议：

- `Your spots stay yours.`
- `Private waypoints by default.`

尺寸：

- 隐私模块图：1600×1000。
- App UI：1170×2532。

## 6. 素材三：用户使用场景视频

目标：用真实场景证明产品好用，覆盖便携、自动扫描、一键启动、3D 重建、环扫图、重建图、AI 推荐、个人记录。

### 场景视频总规格

- 每条主视频：15-30 秒。
- 每条拆分短循环：6-10 秒。
- 横版：1920×1080。
- 竖版：1080×1920。
- 方版：1080×1080。
- 输出格式：MP4 H.264，码率 12-20 Mbps。
- 同步输出无字幕版和带英文字幕版。

### 视频 1：便携到岸边

核心功能：便携。

脚本：

1. 用户从车后备箱或钓具包旁拿起 Kastave。
2. 单手提着产品走向湖边。
3. 镜头给产品提手、船体尺寸、岸边环境。
4. 结束帧：产品放到浅水边。

镜头要求：

- 产品外观必须清楚。
- 用户为美国岸钓/路亚用户形象：帽子、防晒衣、偏光镜、钓具包。
- 不要出现船坞或船载电子设备。

### 视频 2：一键启动自动扫描

核心功能：一键启动、自动扫描。

脚本：

1. 用户打开 App，点击 `Start Scan`。
2. Kastave 从岸边缓慢向前。
3. 水面叠加路径线。
4. App 里显示 Auto Scan Running。

必须表达：

- 用户不用反复抛投设备。
- 无人船自己沿可触达岸线扫描。

### 视频 3：3D 重建与环扫图

核心功能：3D 重建、环扫图、重建图。

脚本：

1. Kastave 扫描一段岸线。
2. App 中从 2D 路径切换到 3D underwater view。
3. 环扫图/扫描覆盖区域生成。
4. 水下结构逐渐清晰：drop-off、rocks、weed edge。

交付：

- App UI 录屏风格视频。
- 场景 + UI 合成视频。

### 视频 4：AI 推荐 3 个抛投点

核心功能：AI 推荐。

脚本：

1. 用户看手机 App。
2. 3D 重建完成后，三个点依次出现。
3. App 给出建议：
   - Safe Cast
   - Structure Cast
   - Risk / Reward
4. 用户选择 Structure Cast，拿起路亚竿抛投。

注意：

- 抛投动作要自然，第一视角或肩后视角均可。
- 不能让 Kastave挡住抛投路线。

### 视频 5：无感记录个人钓点

核心功能：个人记录。

脚本：

1. 用户在 App 里点击 `Save Spot`。
2. 自动保存当前扫描点、水温、深度、备注。
3. 显示 `Private waypoint saved`。
4. 用户继续钓鱼，不需要复杂填写。

隐私表达：

- `Private by default`
- `No public spot feed`

## 7. 素材四：产品参数图

目标：建立产品可信度，像消费电子硬件参数页，不像概念 PPT。

### 主图版式

参考结构：

- 上半部分：产品大图，占画面 50%-60%。
- 左侧大标题：`Built tough. Bank ready.`
- 下方横向参数图标：6-8 个参数。
- 底部保留 CTA 区域：`Reserve for $1`

主尺寸：

- 桌面：2400×1350。
- 网页：1920×1080。
- 移动：1080×1350。
- 社媒方版：1080×1080。

### 参数内容

| 参数 | 英文展示 | 数值 | 备注 |
|---|---|---:|---|
| 电池 | Battery Life | 6 hours | target runtime |
| 重量 | Weight | 5 kg | about 11 lb |
| 声呐探测范围 | Sonar Range | 20 m radius | shoreline scan coverage |
| 连接 | Connectivity | Wi-Fi 6 / Bluetooth 5.4 | phone pairing and live map |
| 航行速度 | Cruise Speed | 1.5 m/s max | quiet scan at lower speed |
| 抗风浪 | Wind & Chop | Beaufort 3 | light chop, about 0.3 m |
| 控制模式 | Modes | Auto / Silent / Performance | app controlled |
| 数据输出 | Output | 3D map + 3 cast calls | Safe / Structure / Risk-Reward |

备注：

- 当前参数建议标注为 `Prototype targets` 或 `Kickstarter field-test targets`。
- 如果后续工程参数变化，参数图需要可编辑源文件。

交付：

- 参数主图：2400×1350 PNG/JPG。
- 移动版参数图：1080×1350 PNG/JPG。
- 单独参数图标：SVG + PNG，黑色和橙色两套。
- 可编辑源文件：Figma / PSD / AI。

## 8. 素材五：航行速度视频

目标：展示 Kastave 不是静态漂浮设备，而是能稳定、可控地自主航行扫描。

### 内容要求

视频需要展示三种运动状态：

1. Auto Mode：稳定沿岸扫描，速度中等，路径可重复。
2. Silent Mode：低速、低尾流、靠近鱼区。
3. Performance Mode：更快覆盖长岸线，适合时间短或大水面。

### 镜头脚本

1. 远景：Kastave 从岸边启动。
2. 中景：船体平稳前进，水面尾流清晰但不过度夸张。
3. 俯视或半俯视：显示路径线和速度标记。
4. App UI 插入：模式切换 Auto / Silent / Performance。
5. 结束帧：路线覆盖完成，显示 `Scan complete`。

### 交付规格

- 横版主视频：1920×1080，10-15 秒。
- 竖版广告：1080×1920，10-15 秒。
- 3 条 5 秒循环短片：Auto / Silent / Performance 各一条。
- 封面图：1920×1080 和 1080×1920。

### 画面标注

可以出现：

- `Auto Mode`
- `Silent Mode`
- `Performance Mode`
- `1.5 m/s max`
- `Quiet scan speed`

不要出现：

- 夸张高速竞速效果。
- 巨大浪花。
- 产品飞离水面或像遥控快艇。

## 9. 素材六：UGC 与早期用户内容

目标：为 Reddit、Facebook、广告评论区和独立站补充真实感内容，帮助早期用户理解问题和产品价值。

### 9.1 UGC 视频方向

建议做 6 类：

1. 岸钓用户第一视角：今天这片水面很平静，但不知道下面有什么。
2. 抛投声呐很麻烦：一边拿竿、一边看手机、一边收线。
3. Kastave 自动扫描：用户不用反复 cast/retrieve。
4. 挂底痛点：水面看不出来，水下有树枝/草/石头。
5. App 推荐抛投点：用户根据 Safe / Structure / Risk-Reward 做选择。
6. 私密钓点记录：用户保存自己的 waypoint，不公开分享。

规格：

- 竖版：1080×1920。
- 时长：15-45 秒。
- 风格：手持、自然光、轻微晃动可以接受。
- 字幕：英文短句，每屏不超过 8 个词。

### 9.2 Reddit 养号内容方向

注意：不能伪造真实用户评价，也不要假装已经有大量真实购买反馈。可以用创始人视角、产品开发视角和问题讨论视角。

可发主题：

- `Bank anglers: what do you wish you knew before the first cast?`
- `Would you use an auto-scanning scout before fishing a new pond?`
- `Castable sonar users: what is the most annoying part of the workflow?`
- `How often do you lose lures to hidden brush or grass?`
- `Would private waypoint logging matter to you?`

需要配图：

- 问题示意图：水面平静，水下有隐藏树枝/草。
- Kastave 自动扫描对比图：用户钓鱼，Kastave 自己扫。
- App UI 讨论图：3 个推荐点。

### 9.3 Facebook 早期用户内容方向

目标人群：

- Bank bass anglers。
- Pond hoppers。
- Kayak / shore fishing 用户。
- Castable sonar 用户。

内容类型：

- 15 秒产品功能短视频。
- 3 图轮播：Problem / Scan / Cast Calls。
- Founder offer 图：`$1 deposit / $699 crossed out / $599 / ends in 3 days`。
- 私密钓点保护图：`Your spots stay yours.`

注意：

- 广告素材不要承诺“一定钓到鱼”。
- 不要用 `guaranteed catch`、`never miss fish` 等绝对表达。
- 推荐表达：`read the water before you cast`、`pick a smarter first cast`、`scout reachable water from shore`。

## 10. 页面对应素材清单

| 页面位置 | 需要素材 | 首选尺寸 | 功能目的 |
|---|---|---:|---|
| 首页 Hero | 产品真实场景主图 | 2400×1350 | 让用户记住 Kastave |
| Highlights | 5 张功能图 | 1600×1000 / 1200×900 | 解释核心功能 |
| Who is Kastave For | 4 张用户场景图/短动效 | 1400×1000 | 对应目标人群 |
| App UI | 手机 UI mockup + 自动模式视频 | 1170×2532 / 1080×1920 | 证明软件能力 |
| Privacy | 私密钓点保存图 | 1600×1000 | 建立信任 |
| Specs | 产品参数图 | 2400×1350 | 建立硬件可信度 |
| Reservation | 产品主图 + package includes | 2000×2000 / 2400×1350 | 推动预订 |
| Deposit Hero | founder offer 价格图 | 1920×1080 | 强化限时折扣 |

## 11. 设计交付包结构

建议设计师按以下结构交付：

```text
Kastave_Assets_V2/
  01_app_ui/
    source/
    export_png/
    export_video/
  02_product_hero/
    source/
    export_web/
    transparent_cutout/
  03_user_scenes_video/
    16x9/
    9x16/
    1x1/
  04_specs/
    source/
    export_web/
    icons/
  05_speed_video/
    auto/
    silent/
    performance/
  06_ugc/
    reddit/
    facebook/
    raw/
```

## 12. 验收标准

必须通过：

- 产品外观与 Kastave 当前黑色双体船一致。
- 每个素材能明确对应一个功能，不需要用户猜。
- 图片在移动端裁切后主体仍完整。
- 视频前 3 秒能看懂卖点。
- App UI 内的 Safe / Structure / Risk-Reward 三点清晰可辨。
- 价格素材必须表达：`$1 Deposit Now`、`$699` 划线、`$599` founder price、`Ends in 3 days`。
- 参数素材必须标注为 prototype / field-test target，避免过度承诺。
- 所有素材源文件可编辑，方便后续参数和文案变化。

需要返工：

- 产品外观不像 Kastave。
- 画面过暗、过科幻或信息看不清。
- 水下 3D 重建像游戏，不像钓鱼工具。
- UI 按钮/文字太小，移动端不可读。
- 视频只好看但看不出“自动扫描”和“推荐抛投点”。
- UGC 看起来像虚假评价或伪造真实用户反馈。

## 13. 优先级

P0：必须先做

1. Deposit Hero 价格图：`$699` 划线到 `$599`，3 天限时。
2. App UI：3D 重建 + 三种抛投点。
3. 产品主图：真实岸边场景，产品一致。
4. 自动扫描视频：一键启动 + 自动沿岸扫描。

P1：第二批

1. 产品参数图。
2. 一键记录私密钓点 App UI。
3. 航行速度视频。
4. 用户使用场景视频。

P2：持续补充

1. Reddit 讨论图。
2. Facebook 早期用户内容。
3. UGC 风格短视频。
4. 广告多比例裁切版本。
