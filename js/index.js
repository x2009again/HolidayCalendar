$(function () {

    var $list = $('#tb-list');//, $curMonth = $('#cur-month');
    var $curYear = $("#curYear");//获取年下拉控件
    var $curMonth = $("#curMonth");//获取月下拉控件
    var curDate = new Date(), now = new Date();
    var curYearHoliday;
    initSelect();//初始化下拉
    initBtn();//初始化按钮

    function getHoliday(year) {
        return new Promise(function (resolve, reject) {
            var result = false;
            if (window.HolidayCalendar.hasWorktime(year)) {
                result = true;
                resolve("已经有节假日数据了");
            }
            else {
                console.log("调用接口");
                axios({
                    method: 'get',
                    url: 'http://timor.tech/api/holiday/year/' + year,
                    timeout: 1000
                })
                    .then(function (data) {
                        console.log(data);
                        if (data.code == 0) {
                            var worktime = {};
                            worktime["y" + curDate.getFullYear()] = {};
                            var hasData = false;
                            Object.keys(data.holiday).forEach(function (key) {
                                hasData = true;
                                if (data.holiday[key].holiday == true)//true表示是节假日，false表示是调休
                                {
                                    worktime["y" + curDate.getFullYear()]["d" + key.replace("-", "")] = 2;

                                } else {
                                    worktime["y" + curDate.getFullYear()]["d" + key.replace("-", "")] = 1;
                                }
                            });
                            if (hasData) {
                                window.HolidayCalendar.setWorktime(worktime);//0无特殊安排，1工作，2放假
                                curYearHoliday = worktime;
                            }
                            result = true;
                            resolve("获取节假日数据成功");
                        }
                        else {
                            result = false;
                            reject("获取节假日信息出错，请联系开发人员处理");
                            console.log("错误1");

                        }
                    })
                    .catch(function (error) {
                        // debugger;
                        console.log(error);
                        result = false;
                        reject("获取节假日信息出错，请联系开发人员处理");
                        console.log("错误2");
                    });
               
            }
        });
    }
    if (navigator.onLine) {
        getHoliday(curDate.getFullYear()).then((message) => {
            localStorage.setItem('_HolidayCalendar_data', JSON.stringify(curYearHoliday));
            // setMonth(curDate.getFullYear(), curDate.getMonth());
        }).catch((error) => {
            console.log(error);
        });
    }

    // 从缓存获取数据
    if (localStorage.getItem('_HolidayCalendar_data') != "undefined") {
        var cacheData = JSON.parse(localStorage.getItem('_HolidayCalendar_data'));
        if (cacheData) {
            // bigWeeks = cacheData.bigweeks;
            window.HolidayCalendar.setWorktime(cacheData);
        }
    }

    //初始化当前月面板
    setMonth(curDate.getFullYear(), curDate.getMonth(), true);
    $list.fadeIn();

    // 设置当前日期信息
    var cur_info = window.HolidayCalendar.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
    // 节日
    var jieri = [];
    cur_info.term && jieri.push(cur_info.term);
    cur_info.solarFestival && jieri.push(cur_info.solarFestival);
    cur_info.lunarFestival && jieri.push(cur_info.lunarFestival);
    // 拼装数据
    var cur_html = '今天:【' + cur_info.zodiac + '年】 ' +
        cur_info.GanZhiYear + '年/' + cur_info.GanZhiMonth + '月/' + cur_info.GanZhiDay + '日' +
        '<i>' + cur_info.lunarMonthName + cur_info.lunarDayName + '</i>' +
        '<span>' + jieri.join('/') + '</span>';

    $('#cur-info').html(cur_html);

    $('#cur-info').on('click', function () {
        curDate = now;
        setMonth(now.getFullYear(), now.getMonth());
    });

    //设置月面板
    function setMonth(year, month, hasHoliday) {
        if (!hasHoliday) {
            hasHoliday = false;
        }
        $curYear.val(year);
        $curMonth.val(month + 1);
        if (!hasHoliday && (year <= now.getFullYear() + 1)) {
            getHoliday(year).then((message) => {

            }).catch((error) => {
                console.log(error);
            });
        }
        var curWeeks = getWeeks(year, month);//划分一个月中的周期
        //设置月历面板列表
        setList(curWeeks, year);
    }
    //初始化下拉
    function initSelect() {
        $curYear.empty();
        for (i = 1900; i < 2101; i++) {
            $curYear.append("<option value=" + i + ">" + i + "</option>");
        }
        $curYear.change(yearChange);
        $curMonth.empty();
        for (j = 1; j < 13; j++) {
            $curMonth.append("<option value=" + j + ">" + j + "</option>");
        }
        $curMonth.change(monthChange);
    }
    //修改年
    function yearChange() {
        curDate = new Date($(event.currentTarget).val(), $curMonth.val() - 1, 1);
        setMonth(curDate.getFullYear(), curDate.getMonth());
    }
    //修改月
    function monthChange() {
        curDate = new Date($curYear.val(), $(event.currentTarget).val() - 1, 1);
        setMonth(curDate.getFullYear(), curDate.getMonth());
    }
    //初始化上、下一年，上、下一月，返回今天点击事件
    function initBtn() {
        $("#preYear").click(function () {
            curDate = new Date(curDate.getFullYear() - 1, curDate.getMonth(), 1);
            setMonth(curDate.getFullYear(), curDate.getMonth())
        });

        $("#nextYear").click(function () {
            curDate = new Date(curDate.getFullYear() + 1, curDate.getMonth(), 1);
            setMonth(curDate.getFullYear(), curDate.getMonth());
        });

        $("#preMonth").click(function () {
            curDate = new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1);
            setMonth(curDate.getFullYear(), curDate.getMonth())
        });

        $("#nextMonth").click(function () {
            curDate = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1);
            setMonth(curDate.getFullYear(), curDate.getMonth())
        });
        $("#btnToday").click(function () {
            curDate = new Date(now.getFullYear(), now.getMonth(), 1);
            setMonth(curDate.getFullYear(), curDate.getMonth())
        });
    }


    function setList(weeks, year) {
        $list.empty();
        for (var i = 0; i < weeks.length; i++) {
            var week = weeks[i];
            var tds = [];
            for (var k = 0; k < week.length; k++) {
                var d = new Date(week[k]);
                if (k == 0 && d.getDay() > 0) {
                    // 补位
                    var firstDay = d.getDay();  // 第一天
                    for (var m = 0; m < firstDay; m++) {
                        var pcd = new Date(d.getFullYear(), d.getMonth(), d.getDate() - firstDay + m);
                        _setDayInfo(tds, pcd, year, 'disabled');
                    }
                }
                _setDayInfo(tds, d, year, null);
            }
            if (tds.length < 7) {
                var dd = new Date(week[week.length - 1]);   // 最后一天
                var len = 7 - tds.length;
                for (var k = 0; k < len; k++) {
                    var lcd = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate() + k + 1);
                    _setDayInfo(tds, lcd, year, 'disabled')
                }
            }
            $list.append('<div class="table">' + tds.join('') + '</div>');
        }
    }

    function _setDayInfo(tds, d, year, extraCss) {
        var cls = [];
        // 当前日期
        if (d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth() && d.getDate() == now.getDate()) {
            cls.push('cur');
        }
        var spans = '<p>' + d.getDate() + '</p>';
        d.getDay() == 0 && cls.push('weeknum') && (spans = spans + "<span>" + getWeekNum(d, year) + "</span>");

        // 农历信息
        var nongLi = window.HolidayCalendar.solarToLunar(d.getFullYear(), d.getMonth() + 1, d.getDate());
        if (nongLi.worktime == 1) {
            // 补班
            cls.push('work');
        } else if (nongLi.worktime == 2) {
            // 放假
            cls.push('holiday');
        }
        if (extraCss) { cls.push(extraCss) }
        var cls2 = nongLi.term || nongLi.lunarFestival || nongLi.solarFestival ? 'red' : '';
        spans += '<p class="' + cls2 + '">' + (nongLi.lunarFestival || nongLi.solarFestival || nongLi.term || (nongLi.lunarDayName == '初一' ? nongLi.lunarMonthName : nongLi.lunarDayName)) + '</p>';
        tds.push('<div class="' + cls.join(' ') + '">' + spans + '</div>');
    }

    // 划分一个月中的周期
    function getWeeks(year, month) {
        var start_date = new Date(year, month, 1);
        var end_date = new Date(year, month + 1, 0);

        var res = [], week = [];
        for (var i = start_date.getDate(); i <= end_date.getDate(); i++) {
            start_date.setDate(i);
            if (start_date.getDay() == 0) {
                week.length > 0 && res.push(week);
                week = [start_date.getTime()]
            } else {
                week.push(start_date.getTime());
            }
            if (start_date.getDate() == end_date.getDate()) {
                res.push(week);
            }
        }
        return res;
    }

    function getWeekNum(date, year) {
        var currentyear = $curYear.val();
        // debugger;
        var dd = year != date.getFullYear() ? 1 : (dateiff(date, new Date(date.getFullYear(), 0, 1)) + new Date(year, 0, 1).getDay() + 1) / 7;
        return Math.ceil(dd);
    }
    function dateiff(sDate1, sDate2) {
        var dateSpan,
            iDays;
        dateSpan = sDate1.getTime() - sDate2.getTime();
        iDays = Math.floor(dateSpan / (24 * 60 * 60 * 1000));
        return iDays
    };

});