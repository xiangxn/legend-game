export const EQUIPMENT_CACHE_KEY = "Legend-Equipment-cache";
export const TOTEM_CACHE_KEY = "Legend-Totem-cache";
export const CONSUMABLES_CACHE_KEY = "Legend-Consumables-cache";
export const BOX_CACHE_KEY = "Legend-Box-cache";
export const FRIEND_CACHE_KEY = "Legend-friend-cache";
export const VERSION_CACHE_KEY = "version-cache-key";

export const Constant = {
    version: "1.0.0",
    // chainId: 56,
    chainId: 1337,
    apiUrl: "http://127.0.0.1:7545",
    // apiUrl: "https://http-testnet.hecochain.com",
    // apiUrl: "https://bsc-dataseed4.binance.org/",
    // rpcProvider: { "256": "https://http-testnet.hecochain.com" },
    annUrl: "https://www.legendnft.com/announcement.json",
    rpcUrl: "https://data.legendnft.com/jsonrpc",
    // rpcUrl: "http://localhost:9090/jsonrpc",
    poolUrl: "https://www.legendnft.com/pools.json",
    address: {
        USDT: "0xCbF54d7E4e0223b6D325F5247cCC9814d123B8e9",
        Hero: "0x927653F44dd59e8a322807390e14F8250b1b1108",
        Equipment: "0x6551bc3Bdde096Df7caCedc115fC3D426FabDf99",
        LGC: "0x4C0756fd69FB018bEF7290416AEfbB1850883F2E",
        StakeMine: "0x880A51d35A2c1eA1a338B8af832c60b37EfB35ee",
        RoleMine: "0xe1C5c97057fd8edd71eE04398Cc221E180577D21",
        ZoneMine: "0x4a54468Dd5F7d1FF534b8b98D27D925d1A8c5DF1",
        BonusPool: "0x3d3165449080772723ffC9b3977eA988143059F4",
        Fragment: "0x444363f6ce720fb90921087e87AF14Fbae6eb39E",
        Totem: "0x86e0677d211A11DF67B7b52ac65Ed578381F0b78",
        Store: "0x1B64b1fc5f997971953ABFE6E401ebae9555Bc87",
        Box: "0x530d817d6153189eB924908c88E8A9f79858Ab5C",
        PreSale: "0xf1A2553324bC5C7d55CEa0bf149a19bf2e383d8a",
        Friend: "0xb3cda18C4B37005291631ecC2B6DC929Cf11245A",
        Market: "0xFddfEF2F43Fa48ca79F182A140e9283A757260AC",
        Referral: "0xEA5D52B67c74e937E42a44303Ec1dECA63F0fE09"
    },
    paymode: {
        "0x4C0756fd69FB018bEF7290416AEfbB1850883F2E": "LGC",
        "0xCbF54d7E4e0223b6D325F5247cCC9814d123B8e9": "USDT"
    },
    intRegExp: new RegExp("^[0-9]*$"),
    lockDuration: 3600 * 24 * 2,
    profession: ["通用", "战士", "法师", "道士"],
    equipmentType: ["武器", "头盔", "盔甲", "项链", "戒指", "手镯"],
    qualityColor: ["#ffffff", "#79b7fe", "#f7dc94"],
    store: {
        LGC: [
            { goodsId: 6, name: "入门甲胄箱", coin: "LGC", img: "box4", desc: "概率开出1-10级各职业除武器外所有装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 7, name: "普通甲胄箱", coin: "LGC", img: "box5", desc: "概率开出11-20级各职业除武器外所有装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 8, name: "稀有甲胄箱", coin: "LGC", img: "box6", desc: "概率开出21-30级各职业除武器外所有装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 9, name: "经验丹", coin: "LGC", img: "3-3", desc: "角色面板使用，可增加角色经验。", note: "" },
            { goodsId: 11, name: "金疮药", coin: "LGC", img: "3-4", desc: "进入副本[比奇森林]探险的必需品，根据时间消耗。", note: "" }
        ],
        USDT: [
            { goodsId: 3, name: "入门武器箱", coin: "USDT", img: "box1", desc: "概率开出1-10级各职业武器装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 4, name: "普通武器箱", coin: "USDT", img: "box2", desc: "概率开出11-20级各职业武器装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 5, name: "稀有武器箱", coin: "USDT", img: "box3", desc: "概率开出21-30级各职业武器装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 1, name: "鹤嘴锄", coin: "USDT", img: "3-1", desc: "进入角色矿洞挖矿的必需品，根据时间消耗。", note: "" },
            { goodsId: 2, name: "疗伤药", coin: "USDT", img: "3-2", desc: "进入副本探险的必需品，根据时间消耗。", note: "" }
        ]
    },
    consumables: {
        1: ["鹤嘴锄", "1356938545749799165144492409224415641889241185234880306775293388547669622784"],
        2: ["疗伤药", "1356938545749799165169012337878269863622974737669285253713193214502607257600"],
        3: ["经验丹", "1356938545749799165193532266532124085356708290103690200651093040457544892416"],
        4: ["金疮药", "1356938545749799165218052195185978307090441842538095147588992866412482527232"]
    },
    totems: {
        1: ["祖玛图腾", "兑换奖池专用,每期一个", "可合成祖玛图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"],
        2: ["沃玛图腾", "兑换奖池专用,每期二个", "可合成沃玛图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"],
        3: ["尸王图腾", "兑换奖池专用,每期五个", "可合成尸王图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"],
        4: ["血骷髅图腾", "兑换奖池专用,每期20个", "可合成血骷髅图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"]
    },
    boxs: {
        1: "入门武器箱",
        2: "普通武器箱",
        3: "稀有武器箱",
        4: "入门甲胄箱",
        5: "普通甲胄箱",
        6: "稀有甲胄箱",
        7: "预售宝箱",
        8: "赤月武器箱"
    },
    equipments: {
        "10001": "黑铁剑", "10002": "斩马刀", "10003": "阿修罗斧", "10004": "凝霜重剑", "10005": "炼狱战斧",
        "10006": "井中月", "10007": "命运", "10008": "裁决", "10009": "屠龙", "10010": "初级法杖",
        "10011": "海魂杖", "10012": "偃月杖", "10013": "破魂杖", "10014": "黑魔杖", "10015": "赤血法剑",
        "10016": "血炼", "10017": "骨玉", "10018": "嗜魂", "10019": "桃木剑", "10020": "乌木剑",
        "10021": "凌风剑", "10022": "除魔剑", "10023": "金蛇剑", "10024": "无极", "10025": "真武剑",
        "10026": "龙纹", "10027": "逍遥游", "10028": "布甲", "10029": "厚布甲", "10030": "重型盔甲",
        "10031": "战神盔甲", "10032": "圣战铠甲", "10033": "天魔战甲", "10034": "灵魂战衣", "10035": "幽灵玄甲",
        "10036": "天尊长袍", "10037": "道尊长袍", "10038": "法师长袍", "10039": "恶魔长袍", "10040": "法神之佑",
        "10041": "霓裳羽衣", "10042": "黑水晶项链", "10043": "蓝翡翠项链", "10044": "幽灵项链", "10045": "绿色项链",
        "10046": "战神项链", "10047": "黄水晶项链", "10048": "竹笛", "10049": "天诛项链", "10050": "灵魂之镜",
        "10051": "天尊项链", "10052": "琥珀项链", "10053": "放大镜", "10054": "生命之链", "10055": "恶魔镇魂铃",
        "10056": "法神项链", "10057": "新手头盔", "10058": "青铜头盔", "10059": "骷髅头盔", "10060": "黑铁头盔",
        "10061": "战神头盔", "10062": "道者头饰", "10063": "道尊头盔", "10064": "法术头饰", "10065": "法神头盔",
        "10066": "武力手镯", "10067": "死神之握", "10068": "幽灵之爪", "10069": "骑士手镯", "10070": "战神手镯",
        "10071": "黑檀木镯", "10072": "镇金手镯", "10073": "思贝儿手镯", "10074": "龙骨手镯", "10075": "法神手镯",
        "10076": "道士手镯", "10077": "阎罗手套", "10078": "心灵手镯", "10079": "三眼手镯", "10080": "道尊手镯",
        "10081": "古铜戒指", "10082": "骷髅战戒", "10083": "金龙战戒", "10084": "力量战戒", "10085": "战神之戒",
        "10086": "琉璃戒指", "10087": "道法戒指", "10088": "铂阳戒指", "10089": "泰钽戒指", "10090": "道尊戒指",
        "10091": "法檀木戒", "10092": "蛇眼戒指", "10093": "红玉戒指", "10094": "紫螺戒指", "10095": "法神戒指"
    },
    mainAttrs: { attack: "物理攻击", taoism: "道术攻击", magic: "魔法攻击", defense: "物理防御", magicDefense: "魔法防御", physicalPower: "体力值", magicPower: "魔力值" },
    zones: [{ id: 1000, banner: "zone0banner", bg: "zone0bg", equip: "1-10", stype: 4, weight: 0 },
    { id: 1001, banner: "zone1banner", bg: "zone1bg", equip: "1-10", stype: 2, weight: 20 },
    { id: 1002, banner: "zone2banner", bg: "zone2bg", equip: "11-20", stype: 2, weight: 20 },
    { id: 1003, banner: "zone3banner", bg: "zone3bg", equip: "21-30", stype: 2, weight: 20 },
    { id: 1004, banner: "zone4banner", bg: "zone4bg", equip: "31-40", stype: 2, weight: 20 },
    { id: 1005, banner: "zone5banner", bg: "zone5bg", equip: "41-50", stype: 2, weight: 20 }
    ]
};