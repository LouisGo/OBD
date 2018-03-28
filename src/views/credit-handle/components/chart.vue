<template>
    <div>
        <div style="width: 100%;" :style="(type === 'order' || type === 'rate') ? h450: h600" :id="bindId"></div>
    </div>
</template>

<script>
import echarts from 'echarts';

export default {
    name: 'chart-cycle',
    data () {
        return {
            sData: [],
            h450: {
                height: '450px'
            },
            h600: {
                height: '600px'
            }
        };
    },
    props: {
        bindId: {
            type: String,
            required: true
        },
        legend: {
            type: Array,
            required: true
        },
        oData: {
            type: Array,
            required: true
        },
        type: {
            type: String,
            default: 'order'
        },
        xData: {
            type: Array,
            required: true
        },
        yData: {
            type: Array,
            required: true
        },
        colors: {
            type: Array,
            default: () => {
                return ['#3f9e6f', '#4c85dc', '#f2a243'];
            }
        },
        needSlide: {
            type: Boolean,
            default: false
        }
    },
    created () {
        this.$nextTick(() => {
            this.init();
        });
    },
    methods: {
        init () {
            let option;
            if (this.needSlide) {
                if (this.type === 'order') {
                    this.transferChartData(this.oData, this.sData, ['AvgAmount', 'Amount', 'Total']);
                    option = {
                        color: this.colors,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            }
                        },
                        toolbox: {
                            feature: {
                                restore: {show: true},
                                dataView: {show: true, readOnly: false},
                                magicType: {show: true, type: ['line', 'bar']},
                                saveAsImage: {show: true}
                            }
                        },
                        grid: {
                            left: '25%'
                        },
                        dataZoom: {
                            start: 0,
                            end: 33,
                            zoomLock: true
                        },
                        legend: {
                            data: this.legend,
                            top: 0
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: this.xData,
                                axisPointer: {
                                    type: 'shadow'
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                name: this.yData[0],
                                min: 0,
                                position: 'left',
                                offset: 80,
                                axisLabel: {
                                    formatter: '$ {value}'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: this.colors[0]
                                    }
                                }
                            },
                            {
                                type: 'value',
                                name: this.yData[2],
                                min: 0,
                                axisLabel: {
                                    formatter: '{value}单'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: this.colors[2]
                                    }
                                }
                            },
                            {
                                type: 'value',
                                name: this.yData[1],
                                position: 'left',
                                min: 0,
                                axisLabel: {
                                    formatter: '{value}'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: this.colors[1]
                                    }
                                }
                            }
                        ],
                        series: [
                            {
                                name: this.legend[0],
                                type: 'bar',
                                data: this.sData[0]
                            },
                            {
                                name: this.legend[1],
                                type: 'bar',
                                yAxisIndex: 2,
                                data: this.sData[1]
                            },
                            {
                                name: this.legend[2],
                                type: 'line',
                                yAxisIndex: 1,
                                data: this.sData[2]
                            }
                        ]
                    };
                }
                if (this.type === 'rate') {
                    this.transferChartData(this.oData, this.sData, ['BadCommentCount', 'GoodCommentCount', 'DSRScore']);
                    option = {
                        color: this.colors,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            }
                        },
                        toolbox: {
                            feature: {
                                restore: {show: true},
                                dataView: {show: true, readOnly: false},
                                magicType: {show: true, type: ['line', 'bar']},
                                saveAsImage: {show: true}
                            }
                        },
                        grid: {
                            left: '25%'
                        },
                        dataZoom: {
                            start: 0,
                            end: 33,
                            zoomLock: true
                        },
                        legend: {
                            data: this.legend,
                            top: 0
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: this.xData,
                                axisPointer: {
                                    type: 'shadow'
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                name: this.yData[0],
                                min: 0,
                                position: 'left',
                                offset: 80,
                                axisLabel: {
                                    formatter: '{value}例'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: this.colors[0]
                                    }
                                }
                            },
                            {
                                type: 'value',
                                name: this.yData[2],
                                min: 0,
                                axisLabel: {
                                    formatter: '{value}'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: this.colors[2]
                                    }
                                }
                            },
                            {
                                type: 'value',
                                name: this.yData[1],
                                position: 'left',
                                min: 0,
                                axisLabel: {
                                    formatter: '{value}例'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: this.colors[1]
                                    }
                                }
                            }
                        ],
                        series: [
                            {
                                name: this.legend[0],
                                type: 'bar',
                                data: this.sData[0]
                            },
                            {
                                name: this.legend[1],
                                type: 'bar',
                                yAxisIndex: 2,
                                data: this.sData[1]
                            },
                            {
                                name: this.legend[2],
                                type: 'line',
                                yAxisIndex: 1,
                                data: this.sData[2]
                            }
                        ]
                    };
                }
            } else {
                switch (this.type) {
                    case 'order':
                        this.transferChartData(this.oData, this.sData, ['AvgAmount', 'Amount', 'Total']);
                        option = {
                            color: this.colors,
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'cross'
                                }
                            },
                            grid: {
                                left: '25%'
                            },
                            toolbox: {
                                feature: {
                                    restore: {show: true},
                                    dataView: {show: true, readOnly: false},
                                    magicType: {show: true, type: ['line', 'bar']},
                                    saveAsImage: {show: true}
                                }
                            },
                            legend: {
                                // data: ['平均订单金额','订单总额','订单总数'],
                                data: this.legend,
                                bottom: 0
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    // data: ['第1年', '第2年', '第3年'],
                                    data: this.xData,
                                    axisPointer: {
                                        type: 'shadow'
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    name: this.yData[0],
                                    min: 0,
                                    position: 'left',
                                    offset: 80,
                                    axisLabel: {
                                        formatter: '{value}'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[0]
                                        }
                                    }
                                },
                                {
                                    type: 'value',
                                    name: this.yData[2],
                                    min: 0,
                                    position: 'right',
                                    axisLabel: {
                                        formatter: '{value}单'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[2]
                                        }
                                    }
                                },
                                {
                                    type: 'value',
                                    name: this.yData[1],
                                    position: 'left',
                                    min: 0,
                                    axisLabel: {
                                        formatter: '{value}'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[1]
                                        }
                                    }
                                }

                            ],
                            series: [
                                {
                                    name: this.legend[0],
                                    type: 'bar',
                                    barMaxWidth: 30,
                                    data: this.sData[0]
                                },
                                {
                                    name: this.legend[1],
                                    type: 'bar',
                                    yAxisIndex: 2,
                                    barMaxWidth: 30,
                                    data: this.sData[1]
                                },

                                {
                                    name: this.legend[2],
                                    type: 'line',
                                    barMaxWidth: 30,
                                    yAxisIndex: 1,
                                    data: this.sData[2]
                                }

                            ]
                        };
                        break;
                    case 'rate':
                        this.transferChartData(this.oData, this.sData, ['BadCommentCount', 'GoodCommentCount', 'DSRScore']);
                        option = {
                            color: this.colors,
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'cross'
                                }
                            },
                            grid: {
                                left: '25%'
                            },
                            toolbox: {
                                feature: {
                                    restore: {show: true},
                                    dataView: {show: true, readOnly: false},
                                    magicType: {show: true, type: ['line', 'bar']},
                                    saveAsImage: {show: true}
                                }
                            },
                            legend: {
                                // data: ['平均订单金额','订单总额','订单总数'],
                                data: this.legend,
                                bottom: 0
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    // data: ['第1年', '第2年', '第3年'],
                                    data: this.xData,
                                    axisPointer: {
                                        type: 'shadow'
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    name: this.yData[0],
                                    min: 0,
                                    position: 'left',
                                    offset: 80,
                                    axisLabel: {
                                        formatter: '{value}例'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[0]
                                        }
                                    }
                                },
                                {
                                    type: 'value',
                                    name: this.yData[2],
                                    min: 0,
                                    position: 'right',
                                    axisLabel: {
                                        formatter: '{value}'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[2]
                                        }
                                    }
                                },
                                {
                                    type: 'value',
                                    name: this.yData[1],
                                    position: 'left',
                                    min: 0,
                                    axisLabel: {
                                        formatter: '{value}例'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[1]
                                        }
                                    }
                                }

                            ],
                            series: [
                                {
                                    name: this.legend[0],
                                    type: 'bar',
                                    barMaxWidth: 30,
                                    data: this.sData[0]
                                },
                                {
                                    name: this.legend[1],
                                    type: 'bar',
                                    yAxisIndex: 2,
                                    barMaxWidth: 30,
                                    data: this.sData[1]
                                },

                                {
                                    name: this.legend[2],
                                    type: 'line',
                                    barMaxWidth: 30,
                                    yAxisIndex: 1,
                                    data: this.sData[2]
                                }

                            ]
                        };
                        break;
                    case 'class':
                        this.transferChartData(this.oData, this.sData, ['AmountPercent', 'TotalPercent']);
                        option = {
                            color: this.colors,
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'cross'
                                }
                            },
                            toolbox: {
                                feature: {
                                    restore: {show: true},
                                    dataView: {show: true, readOnly: false},
                                    magicType: {show: true, type: ['line']},
                                    saveAsImage: {show: true}
                                }
                            },
                            grid: {
                                bottom: '35%'
                            },
                            legend: {
                                // data: ['平均订单金额','订单总额','订单总数'],
                                data: this.legend,
                                top: 0
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    // data: ['第1年', '第2年', '第3年'],
                                    data: this.xData,
                                    axisPointer: {
                                        type: 'shadow'
                                    },
                                    axisLabel: {
                                        interval: 0,
                                        rotate: '45'
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    name: this.yData[0],
                                    min: 0,
                                    axisLabel: {
                                        formatter: '{value}%'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[0]
                                        }
                                    }
                                },
                                {
                                    type: 'value',
                                    name: this.yData[1],
                                    min: 0,
                                    axisLabel: {
                                        formatter: '{value}%'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[1]
                                        }
                                    }
                                }
                            ],
                            series: [
                                {
                                    name: this.legend[0],
                                    type: 'bar',
                                    barMaxWidth: 30,
                                    data: this.sData[0]
                                },
                                {
                                    name: this.legend[1],
                                    type: 'bar',
                                    barMaxWidth: 30,
                                    yAxisIndex: 1,
                                    data: this.sData[1]
                                }
                            ]
                        };
                        break;
                    case 'listing':
                        this.transferChartData(this.oData, this.sData, ['AmountPercent', 'TotalPercent']);
                        option = {
                            color: this.colors,
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'cross'
                                }
                            },
                            toolbox: {
                                feature: {
                                    restore: {show: true},
                                    dataView: {show: true, readOnly: false},
                                    magicType: {show: true, type: ['line']},
                                    saveAsImage: {show: true}
                                }
                            },
                            grid: {
                                bottom: '35%'
                            },
                            legend: {
                                data: this.legend,
                                top: 0
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    data: this.xData,
                                    axisPointer: {
                                        type: 'shadow'
                                    },
                                    axisLabel: {
                                        interval: 0,
                                        rotate: '45'
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: 'value',
                                    name: this.yData[0],
                                    min: 0,
                                    axisLabel: {
                                        formatter: '{value}%'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[0]
                                        }
                                    }
                                },
                                {
                                    type: 'value',
                                    name: this.yData[1],
                                    min: 0,
                                    axisLabel: {
                                        formatter: '{value}%'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: this.colors[1]
                                        }
                                    }
                                }
                            ],
                            series: [
                                {
                                    name: this.legend[0],
                                    type: 'bar',
                                    barMaxWidth: 30,
                                    data: this.sData[0]
                                },
                                {
                                    name: this.legend[1],
                                    type: 'bar',
                                    barMaxWidth: 30,
                                    yAxisIndex: 1,
                                    data: this.sData[1]
                                }
                            ]
                        };
                        break;
                    default:
                        break;
                }
            }
            const target = echarts.init(document.getElementById(this.bindId));
            target.setOption(option);
            window.addEventListener('resize', function () {
                target.resize();
            });
        },
        // 图表数据转化方法
        transferChartData (arr, to, map) {
            for (let i = 0; i < map.length; i++) {
                to.push([]);
                for (let j = 0; j < arr.length; j++) {
                    to[i].push(arr[j][map[i]]);
                }
            }
        }
    }
};
</script>

<style>

</style>
