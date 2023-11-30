const MonthDay = (year, month) => { //年月入力その月が何日あるか計算
    let tmp = 0;
    switch(month) {
        case 1:
            tmp = 31;
            break;
        case 2:
            if (year % 4 !== 0) {
                // 年が4で割り切れない場合、平年
                tmp = 28;
            } else if (year % 100 !== 0) {
                // 年が4で割り切れ、かつ100で割り切れない場合、うるう年
                tmp = 29;
            } else if (year % 400 === 0) {
                // 年が100で割り切れ、かつ400でも割り切れる場合、うるう年
                tmp = 29;
            } else {
                // 年が100で割り切れるが、400で割り切れない場合、平年
                tmp = 28;
            }
            break;
        case 3:
            tmp = 31;
            break;
        case 4: 
            tmp = 30;
            break;
        case 5:
            tmp = 31;
            break;
        case 6:
            tmp = 30;
            break;
        case 7:
            tmp = 31;
            break;
        case 8:
            tmp = 31;
            break;
        case 9:
            tmp = 30;
            break;
        case 10:
            tmp = 31;
            break;
        case 11:
            tmp = 30;
            break;
        case 12:
            tmp = 31;
            break;
        default:
            break;
    }

    return tmp;
}   

export default MonthDay;
