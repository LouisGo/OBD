import Mock from 'mockjs';

// 前期初步部署的mock方法（参考）
const mock1 = Mock.mock('/login', (options) => {
    var decode = JSON.parse(options.body);
    if (decode.password === '123456' && decode.username === 'admin') {
        return Mock.mock({
            'data': '',
            'msg': '登录成功',
            'status': 1,
            'token': '666',
            'avatar': 'http://i.liebao.cn/portrait/src/img/6.jpg'
        });
    } else {
        return Mock.mock({
            'data': null,
            'msg': '用户名不存在',
            'status': -1
        });
    }
});

const mock2 = Mock.mock('/getCreditListData', {
    'Data|8-40': [{
        'num|1': [
            '1234567412', '2123456312', '4124567241', '3124567612', '6124567412'
        ],
        'shop|1': [
            '阿迪达斯', '耐克', '苹果', '安德玛', '三星', '亚马逊', '腾讯'
        ],
        'shopNum|1': [
            '10000', '10001', '10002', '10003', '10004', '10005', '10006'
        ],
        'type|1': [
            '主体授信', '待产授信'
        ],
        'quota|10000-20000': 10000
    }]
});

const mock3 = Mock.mock('/getCreditSpeInfoData', (options) => {
    // var decode = JSON.parse(options.body);
    return Mock.mock({
        'total': 12.5,
        'quota': 2,
        'limit': '16000.00',
        'shop': ['adidas', 'apple']
    });
});

const mock4 = Mock.mock('/getCreditShopData', [
    {
        value: 'adidas',
        name: '阿迪达斯'
    },
    {
        value: 'nike',
        name: '耐克'
    },
    {
        value: 'apple',
        name: '苹果'
    },
    {
        value: 'underarmour',
        name: '安德玛'
    },
    {
        value: 'sumsung',
        name: '三星'
    },
    {
        value: 'amazon',
        name: '亚马逊'
    }
]);

const mock5 = Mock.mock('/getCreditSpeByMonthData', (options) => {
    return Mock.mock({
        'data|15': [
            {
                'totalCount|20000-150000.2': 0,
                'totalOrder|100-800': 0,
                'GoodCommentCount': 0,
                'BadCommentCount': 0,
                'DSRScore': 100.0,
                'AccountId': 83,
                'Currency': 'USD',
                'Day|1-30': 1,
                'Month|1-12': 1,
                'Year|2017-2018': 1,
                'PlatformType': 4,
                'TimeType': 2,
                'UserId': 'id-214215215125',
                'Amount|300-600.2': 0,
                'Total|20-60': 21,
                'AvgAmount|21-40.2': 15.47
            }
        ],
        'status': 1
    });
});

const mock6 = Mock.mock('/getCreditSpeByDayData', (options) => {
    return Mock.mock({
        'data|29-31': [
            {
                'totalCount|20000-150000.2': 0,
                'totalOrder|100-800': 0,
                'totalLike|0-100': 0,
                'totalUnlike|0-10': 0,
                'DSR|3-5.1': 0,
                // 'month|+1': 1,
                'date': '@date("yyyy-MM-dd")'
            }
        ]
    });
});

const mock7 = Mock.mock('/getCreditSpeByTypeData', (options) => {
    return Mock.mock({
        'data|10': [
            {
                'type': '@cname',
                'salePercent|5-80.2': 0,
                'orderPercent|10-60.2': 0
            }
        ]
    });
});

const mock8 = Mock.mock('/getCreditSpeByListingData', (options) => {
    return Mock.mock({
        'data|10': [
            {
                'listing|8': '@cname',
                'salePercent|5-80.2': 0,
                'orderPercent|10-60.2': 0
            }
        ]
    });
});

const mock9 = Mock.mock('/getWarningData', {
    'Items|25': [{
        'Id': '5a60230d97c651480ce52179',
        'OKBUserId': 'c8c68d07-8215-4201-aa1d-46fd1670289c',
        'AlarmType': 2,
        'Year': 2017,
        'Month': 3,
        'Day': 1,
        'Date': '2017-02-28 16:00:00',
        'OrderAmountDecline': -0.8004,
        'IsOrderAmountAlarm': true,
        'OrderCountDecline': 0.0,
        'IsOrderCountAlarm': false,
        'OrderAmountAvgDecline': -0.2018,
        'IsOrderAmountAvgAlarm': true,
        'GoodCommentCountDecline': 0.0,
        'IsGoodCommentCountAlarm': false,
        'BadCommentCountRise': 0.0,
        'IsBadCommentCountAlarm': false,
        'DSRGradeDecline': 0.0,
        'IsDSRGradeAlarm': false,
        'OKBUserName': '谭荣华'
    }]

});

const mock10 = Mock.mock('/confirm', (options) => {
    var decode = JSON.parse(options.body);
    if (decode.limit && decode.password === '123456') {
        return Mock.mock({
            'data': '',
            'msg': '授信成功',
            'status': 1
        });
    } else {
        return Mock.mock({
            'data': null,
            'msg': '密码错误',
            'status': -1
        });
    }
});

const mock11 = Mock.mock('/refuse', (options) => {
    var decode = JSON.parse(options.body);
    if (decode.reason && decode.password === '123456') {
        return Mock.mock({
            'data': '',
            'msg': '拒绝成功',
            'status': 1
        });
    } else {
        return Mock.mock({
            'data': null,
            'msg': '密码错误',
            'status': -1
        });
    }
});

const mock12 = Mock.mock('/getUserListData', (options) => {
    var decode = JSON.parse(options.body);
    if (decode.name) {
        return Mock.mock({
            'Data|8-17': [{
                'userId|1': [
                    '1234567412', '2123456312', '4124567241', '3124567612', '6124567412'
                ],
                'groupName|1': [
                    '管理员', '研发', '产品', '测试', '销售'
                ],
                'groupDesc|1': [
                    '系统管理员', '研发', '产品', '测试', '销售'
                ],
                'userList|1-5': ['@cname']
            }]
        });
    } else {
        return Mock.mock({
            'data': null,
            'msg': '参数错误',
            'status': -1
        });
    }
});

Mock.setup({
    timeout: '700-1400' // 表示响应时间介于 200 和 600 毫秒之间，默认值是'10-100'。
});

export {
    mock1,
    mock2,
    mock3,
    mock4,
    mock5,
    mock6,
    mock7,
    mock8,
    mock9,
    mock10,
    mock11,
    mock12
};
