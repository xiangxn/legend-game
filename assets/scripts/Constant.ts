export const EQUIPMENT_CACHE_KEY = "Legend-Equipment-cache";
export const TOTEM_CACHE_KEY = "Legend-Totem-cache";
export const CONSUMABLES_CACHE_KEY = "Legend-Consumables-cache";
export const BOX_CACHE_KEY = "Legend-Box-cache";
export const FRIEND_CACHE_KEY = "Legend-friend-cache";
export const VERSION_CACHE_KEY = "version-cache-key";
export const MUSIC_IS_PLAY = "music_is_play";

export const Constant = {
    version: "1.1.0",
    // chainId: 56,
    chainId: 1337,
    apiUrl: "http://127.0.0.1:7545",
    // apiUrl: "https://http-testnet.hecochain.com",
    // apiUrl: "https://bsc-dataseed3.binance.org/",
    // rpcProvider: { "256": "https://http-testnet.hecochain.com" },
    annUrl: "https://www.legendnft.com/announcement.json",
    rpcUrl: "https://data.legendnft.com/jsonrpc",
    // rpcUrl: "http://localhost:9090/jsonrpc",
    poolUrl: "https://www.legendnft.com/pools.json",
    strategy: "https://steem.buzz/@legendao",
    telegram: "https://t.me/legendao",
    address: {
        USDT: "0x034f3a08312d2d736044918eEDab0fD925dac7A3",
        Hero: "0x59E9FD99caBc23BC4931384f40f293183AD3Ee40",
        Equipment: "0xe05FD0A46a841965651f2377E91b269C67EE8709",
        LGC: "0x3c8Bb35D390fceec37EF51eC5124B71d6316681e",
        StakeMine: "0x33E7D93CaA32aA759a54754E830E13c0c081e5F6",
        RoleMine: "0x5392fd54dE19c06e1063f0eCC404d2e8C9996FeC",
        ZoneMine: "0x298ef2a5Dff8d3C7dae40FEA8Eb4b3fBC9716c29",
        BonusPool: "0x79FF60bD4a9652c7167197F4302152B120621b74",
        Fragment: "0x8F84c405e828DF17BA6901Fda000023b8a812B0a",
        Totem: "0xB3Ae9D9D1689C3668bb8226730DC72C65bd4189b",
        Store: "0x0affF914896531E36CcfA0B1110AFa61A64C5Fab",
        Box: "0x21C91F3D0B80986fF23061cB7262ee068508C9c3",
        PreSale: "0xf1A2553324bC5C7d55CEa0bf149a19bf2e383d8a",
        Friend: "0x729F64F9428C0E2eD6E0AD012E3160221ff2d6a5",
        Market: "0x10EBb3b54ECa355f256F4Ae48D4D765074eB8490",
        Referral: "0x6Bc4de7c94900552316e5e97b9115861D36EEc2A",
        Team: "0x9b633a55E4c6d2D6217EA9BEbDDc282511377b6D",
        PVP: "0xB07335B3d5177134357218AA1991AbcC6e5FfD03"
    },
    paymode: {
        "0x3c8Bb35D390fceec37EF51eC5124B71d6316681e": "LGC",
        "0x034f3a08312d2d736044918eEDab0fD925dac7A3": "USDT"
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
            // { goodsId: 11, name: "金疮药", coin: "LGC", img: "3-4", desc: "进入副本[比奇森林]探险的必需品，根据时间消耗。", note: "" },
            { goodsId: 9, name: "经验丹", coin: "LGC", img: "3-3", desc: "角色面板使用，可增加角色经验。", note: "" },
            { goodsId: 2, name: "疗伤药", coin: "LGC", img: "3-2", desc: "进入副本探险的必需品，根据时间消耗。", note: "" }
        ],
        USDT: [
            { goodsId: 3, name: "入门武器箱", coin: "USDT", img: "box1", desc: "概率开出1-10级各职业武器装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 4, name: "普通武器箱", coin: "USDT", img: "box2", desc: "概率开出11-20级各职业武器装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            { goodsId: 5, name: "稀有武器箱", coin: "USDT", img: "box3", desc: "概率开出21-30级各职业武器装备。", note: "注意: 购买成功后，可以在储物箱-未开箱查看" },
            // { goodsId: 1, name: "鹤嘴锄", coin: "USDT", img: "3-1", desc: "进入角色矿洞挖矿的必需品，根据时间消耗。", note: "" },
            { goodsId: 12, name: "购买LGC", coin: "USDT", img: "3-5", desc: "LGC为游戏内的区块链货币，购买游戏内的物品。", note: "" }
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
        8: "赤月武器箱",
        9: "赤月宝箱"
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
    zones: [{ id: 1000, banner: "zone0banner", bg: "zone0bg", equip: "1-10", stype: 2, weight: 0 },
    { id: 1001, banner: "zone1banner", bg: "zone1bg", equip: "1-10", stype: 2, weight: 20 },
    { id: 1002, banner: "zone2banner", bg: "zone2bg", equip: "11-20", stype: 2, weight: 20 },
    { id: 1003, banner: "zone3banner", bg: "zone3bg", equip: "21-30", stype: 2, weight: 20 },
    { id: 1004, banner: "zone4banner", bg: "zone4bg", equip: "31-40", stype: 2, weight: 20 },
    { id: 1005, banner: "zone5banner", bg: "zone5bg", equip: "41-50", stype: 2, weight: 20 }
    ],
    coinMarket: [
        {
            name: "Pancake",
            url: "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059ff775485246999027b3197955&outputCurrency=0xe169c6174c40274519c03e8dffa78953a7eb809d"
        },
        {
            name: "MDEX",
            url: "https://bsc.mdex.co/#/swap?inputCurrency=0x55d398326f99059ff775485246999027b3197955&outputCurrency=0xe169c6174c40274519c03e8dffa78953a7eb809d"
        }
    ],
    pvpList: [
        {
            id: 1,
            name: "初级场",
            memo: "说明：进入要求角色30级,战力20000-50000,质押10LGC",
            level: 30,
            minPower: 20000,
            maxPower: 50000,
            fee: 10,
            background: "pvp_bg"
        },
        {
            id: 2,
            name: "中级场",
            memo: "说明：进入要求角色30级,战力50000-100000,质押50LGC",
            level: 30,
            minPower: 50000,
            maxPower: 100000,
            fee: 50,
            background: "pvp_bg2"
        },
        {
            id: 3,
            name: "高级场",
            memo: "说明：进入要求角色40级,战力100000以上,质押100LGC",
            level: 30,
            minPower: 100000,
            maxPower: 0,
            fee: 100,
            background: "pvp_bg3"
        }
    ]
};