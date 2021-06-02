export const EQUIPMENT_CACHE_KEY = "Legend-Equipment-cache";
export const TOTEM_CACHE_KEY = "Legend-Totem-cache";
export const CONSUMABLES_CACHE_KEY = "Legend-Consumables-cache";
export const BOX_CACHE_KEY = "Legend-Box-cache";
export const FRIEND_CACHE_KEY = "Legend-friend-cache";
export const VERSION_CACHE_KEY = "version-cache-key";

export const Constant = {
    version: "1.0.7",
    // chainId: 128,
    chainId: 256,
    // chainId: 1337,
    // apiUrl: "http://127.0.0.1:7545",
    apiUrl: "https://http-testnet.hecochain.com",
    // apiUrl: "https://http-mainnet-node.huobichain.com",
    // rpcProvider: { "256": "https://http-testnet.hecochain.com" },
    annUrl: "https://www.legendnft.com/announcement.json",
    // rpcUrl: "https://data.legendnft.com/jsonrpc",
    rpcUrl: "http://localhost:9090/jsonrpc",
    address: {
        USDT: "0xa71edc38d189767582c38a3145b5873052c3e47a",
        Hero: "0xef349B6b61F7BEABB061ae2B0bF50F06c262d718",
        Equipment: "0xfd52bE427836f31259D8D347AB9410Bf390c8A04",
        LGC: "0xb7A819D170e59D79f6289b91cA1D1a9D0C788A2a",
        StakeMine: "0x6C234aE7E4beaa7816Dfe89efa45094CCDFbA19D",
        RoleMine: "0x672B71f169AbF20448aaC3acA6C0BAaD337C2fF5",
        ZoneMine: "0x04017C2D0Df0cC296c3EE61d70940F3d04fcbEcb",
        BonusPool: "0x13368543dc96195Dc564048DFd598F12AbbC7662",
        Fragment: "0x6C5aD71809c8fA3b6dB9dcC02efe825A33869C33",
        Totem: "0x49De5A35ee679Ea1BF9C27a2CFF85AA220be1527",
        Store: "0xB4BE2df64ca360F0aA5cf6EDFbB58bF5F39182D1",
        Box: "0xAEe308fAb21D185691Fe4ec7dd503a601383586E",
        PreSale: "0x275eeC0aF74F3c5c0562807E57D4cC4625F9a7b9",
        Friend: "0x8C6492E2d9D5404D2b46ffc9f7E6342ADE4602a1"
    },
    paymode: {
        "0xb895492c775e9448B1a45519F3ba8Cd8B76304e7": "LGC",
        "0x7E0dF16259505EA25c766e19cD4f0409a7F31Ec9": "USDT"
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
            { goodsId: 9, name: "经验丹", coin: "LGC", img: "3-3", desc: "角色面板使用，可增加角色经验。", note: "" }
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
        3: ["经验丹", "1356938545749799165193532266532124085356708290103690200651093040457544892416"]
    },
    totems: {
        1: ["祖玛图腾", "兑换奖池专用,每期一个", "可合成祖玛图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"],
        2: ["沃玛图腾", "兑换奖池专用,每期二个", "可合成沃玛图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"],
        3: ["尸王图腾", "兑换奖池专用,每期五个", "可合成尸王图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"],
        4: ["血骷髅图腾", "兑换奖池专用,每期五个", "可合成血骷髅图腾,图腾可兑换奖池奖金,往期图腾及碎片只能销毁获得LGC"]
    },
    boxs: {
        1: "入门武器箱",
        2: "普通武器箱",
        3: "稀有武器箱",
        4: "入门甲胄箱",
        5: "普通甲胄箱",
        6: "稀有甲胄箱",
        7: "预售宝箱"
    },
    equipments: {
        "10001": "黑铁剑", "10002": "斩马刀", "10003": "阿修罗斧", "10004": "凝霜重剑", "10005": "炼狱战斧",
        "10006": "井中月", "10007": "命运", "10008": "裁决", "10009": "屠龙", "10010": "初级法杖",
        "10011": "海魂杖", "10012": "偃月杖", "10013": "破魂杖", "10014": "黑魔杖", "10015": "赤血法剑",
        "10016": "血炼", "10017": "骨玉", "10018": "嗜魂", "10019": "桃木剑", "10020": "铜钱剑",
        "10021": "凌风剑", "10022": "除魔剑", "10023": "金蛇剑", "10024": "无极", "10025": "真武剑",
        "10026": "龙纹", "10027": "逍遥游", "10028": "布甲", "10029": "厚布甲", "10030": "重型盔甲",
        "10031": "战神盔甲", "10032": "圣战铠甲", "10033": "天魔战甲", "10034": "灵魂战衣", "10035": "幽灵玄甲",
        "10036": "天尊长袍", "10037": "道尊长袍", "10038": "法师长袍", "10039": "恶魔长袍", "10040": "法神之佑",
        "10041": "霓裳羽衣", "10042": "黑水晶项链", "10043": "蓝翡翠项链", "10044": "幽灵项链", "10045": "绿色项链",
        "10046": "战神项链", "10047": "黄水晶项链", "10048": "竹笛", "10049": "天诛项链", "10050": "灵魂之镜",
        "10051": "天尊项链", "10052": "琥珀项链", "10053": "放大镜", "10054": "生命之链", "10055": "恶魔镇魂铃",
        "10056": "法神项链", "10057": "绒布头盔", "10058": "青铜头盔", "10059": "骷髅头盔", "10060": "黑铁头盔",
        "10061": "战神头盔", "10062": "道者头饰", "10063": "道尊头盔", "10064": "法术头饰", "10065": "法神头盔",
        "10066": "武力手镯", "10067": "死神之握", "10068": "幽灵之爪", "10069": "骑士手镯", "10070": "战神手镯",
        "10071": "黑檀木镯", "10072": "镇金手镯", "10073": "思贝儿手镯", "10074": "龙骨手镯", "10075": "法神手镯",
        "10076": "道士手镯", "10077": "阎罗手套", "10078": "心灵手镯", "10079": "三眼手镯", "10080": "道尊手镯",
        "10081": "古铜戒指", "10082": "骷髅战戒", "10083": "金龙战戒", "10084": "力量战戒", "10085": "战神之戒",
        "10086": "琉璃戒指", "10087": "道法戒指", "10088": "铂阳戒指", "10089": "泰钽戒指", "10090": "道尊戒指",
        "10091": "法檀木戒", "10092": "蛇眼戒指", "10093": "红玉戒指", "10094": "紫螺戒指", "10095": "法神戒指"
    },
    mainAttrs: { attack: "物理攻击", taoism: "道术攻击", magic: "魔法攻击", defense: "物理防御", magicDefense: "魔法防御", physicalPower: "体力值", magicPower: "魔力值" },
    stakePool: [
        {
            title: "LGC/USDT 2",
            address: "0x0000000000000000000000000000000000000002",
            token: "0xc4cc2edb6039b11280b1D09cf49775Da7fA10F71",
            abi: "StakeMine",
            decimals: 18,
            url: "https://info.mdex.com/#/pair/0xc4cc2edb6039b11280b1D09cf49775Da7fA10F71",
            priceUrl: "https://info.mdex.com",
            isCalc: false
        },
        {
            title: "LGC/USDT",
            address: "0x0000000000000000000000000000000000000001",
            token: "0xc4cc2edb6039b11280b1D09cf49775Da7fA10F71",
            abi: "StakeMine",
            decimals: 18,
            url: "https://info.mdex.com/#/pair/0xc4cc2edb6039b11280b1D09cf49775Da7fA10F71",
            priceUrl: "https://info.mdex.com",
            isCalc: false
        }
        // {
        //     title: "USDT",
        //     address: "0x0C1f227a661063b5013856B8dadA923369e18768",
        //     decimals: 18,
        //     url: "https://info.mdex.com/#/pair/",
        //     priceUrl: "https://info.mdex.com",
        //     isCalc: false
        // }
    ],
    zones: [{ id: 1001, banner: "zone1banner", bg: "zone1bg", equip: "1-10" },
    { id: 1002, banner: "zone2banner", bg: "zone2bg", equip: "11-20" },
    { id: 1003, banner: "zone3banner", bg: "zone3bg", equip: "21-30" }]
};