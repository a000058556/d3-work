// get csv file\
// 用,type 導入下方自己創建的資料處理函式
d3.csv('data/movies02.csv',type02).then(
    res02 =>{
        ready02(res02);
        // console.log('move CSV:',res)
        // debugger;
    }
);

// 建立資料篩選ready()函式，並將資料帶入
function ready02(movies02){
    const moviesClean02 = filterData02(movies02); // 執行資料篩選
    // debugger;
    console.log(moviesClean02);
    // debugger;
    const lineChartDate02 = prepLCData(moviesClean02);
    console.log(lineChartDate02);
    setupCanvas02(lineChartDate02); // 設定要畫圖的開始
};

// 繪製svg圖片 附數時要改名
function setupCanvas02(lineChartDate){
    // 建立svg繪圖空間
    const svg_width = 700;
    const svg_height = 500;
    const chart_margin = {top:80,right:60,bottom:40,left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    const this_svg = d3.select(".line-chart").append("svg") // 找到要繪圖的標籤
        .attr("width", svg_width).attr("height", svg_height)
        .append('g') // 建立群組
        .attr('transform', `translate(${chart_margin.left},${chart_margin.top})`); // 設定偏移
    
    // 抓出最小時間(2000)與最大時間(2009)，用時間做x軸
    const xExtent = d3.extent(lineChartDate.dates); 
    // (d=>d.budget) 每筆資料的revenue (d3.extent)找出最大值與最小值
    // debugger;

    //  最小到最大，時間用d3.scaleTime() 來做平均分布
    const xScale02 = d3.scaleTime().domain(xExtent).range([0,chart_width]);
    // .domain() 是要放的資料
    // range() 畫面上要放的地方，從0到圖表結束(圖表全部)
    
    // 最小(0)到最大值(yMax)
    const yScale02 = d3.scaleLinear().domain([0,lineChartDate.yMax]).range([chart_height,0]);
    // 數學上revenue最小的會放下方，所以要將座標相反[chart_height,0]


    // 生成線
    const lineGen = d3.line()
                        .x(d=>xScale02(d.date))
                        .y(d=>yScale02(d.value));
    const chartG = this_svg.append('g').attr('class','line-chart');


    // 繪製線
    chartG.selectAll('.line-series02')
            .data(lineChartDate.series)
            .enter() //出現
            .append('path').attr('class',d=>`line-series02 ${d.name.toLowerCase()}`) // 設定點
            .attr('d', d=>lineGen(d.values))
            .style('fill', 'none') // 設定樣式
            .style('stroke',d=>d.color);
            // debugger;


    // 畫刻度軸線
    // ticks 決定約略有幾個刻度(依數值狀況)
    // X軸
    const xAxis = d3.axisBottom(xScale02).tickSizeOuter(0);
    this_svg.append('g').attr('class','x axis')
                        .attr('transform',`translate(0,${0,chart_height})`)
                        .call(xAxis)

    // y軸
    const yAxis = d3.axisLeft(yScale02).ticks(5).tickFormat(formatTicks)
                .tickSizeInner(-chart_width).tickSizeOuter(0);
    this_svg.append('g').attr('class','y axis')
                        .call(yAxis);

    // debugger;
    // 畫線的(Label)名稱
    // 放在最後一個點的旁邊(x+5,y不變)
    chartG.append('g').attr('class','series-labels')
            .selectAll('.series-label').data(lineChartDate.series).enter()
            .append('text')
            .attr('x',d=>xScale02(d.values[d.values.length-1].date)+5) //最後一個點x+5
            .attr('y',d=>yScale02(d.values[d.values.length-1].value)) //最後一個點y
            .text(d=>d.name)
            .style('dominant-baseline', 'central')
            .style('font-size', '0.7em').style('font-weight','bold')
            .style('fill',d=>d.color);


    //Draw header
    const header = this_svg.append('g').attr('class','bar-header')
    .attr('transform',`translate(0,${-chart_margin.top/2})`)
    .append('text');
    header.append('tspan').text('Budget and Revenue over time in $US');
    header.append('tspan').text('Films w/ budget and revenue figures, 2000-2009')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');
    
};



// 刻度格式轉換(數字的位數很多時，可以減少位數)
// https://github.com/d3/d3-format/blob/v3.1.0/README.md#locale_format
function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil') // 設定簡寫後的文字呈現
    .replace('G','bil')
    .replace('T','tri')

}



// data utilties 資料前處理
// 遇到NA就設定為undefined(JS的空值:undefined), 要不然就維持原本的字串 
// const parseNA = string => (string === 'NA' ? undefined : string);

// 日期處理，d3.timeParse可指定要讀取的時間格式('%Y-%m-%d')，建立一個處理時間的方法，
// 並把資料(string)帶入，轉換為Date格式
const parseDate02 = string => d3.timeParse('%Y-%m-%d')(string);


// 將字串轉為數字，才可做加總運算
function type02(d){
    const date = parseDate02(d.release_date);
    
    return{
        budget:+d.budget, // +d. 將字串轉為數字
        genre:parseNA(d.genre), // 空值轉換
        // 用JSON.parse轉為json格式,並用.map進到資料用(d=>d.name)取出name的欄位內容
        genres:JSON.parse(d.genres).map(d=>d.name),
        homepage:parseNA(d.homepage),
        id: +d.id,
        imdb_id: parseNA(d.imdb_id),
        original_language: parseNA(d.original_language),
        overview:parseNA(d.overview),
        popularity:+d.popularity,
        poster_path:parseNA(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date,
        release_year: date.getFullYear(), // 可以自己創建欄位
        revenue: +d.revenue,
        runtime: +d.runtime,
        // status: parseNA(d.status) 不要的欄位可以直接拿掉
        tagline: parseNA(d.tagline),
        title: parseNA(d.title),
        // video: "FALSE"  不要的欄位可以直接拿掉
        vote_average: +d.vote_average,
        vote_count: +d.vote_count,

    }
}


// 資料篩選 
function filterData02(data){
    return data.filter( // .filter選出自訂條件的資料內容
        d =>{ // 設定過濾條件，選出符合條件的資料回傳
            return( 
                d.release_year > 1999 && d.release_year < 2010 &&
                d.revenue > 0 &&
                d.budget > 0 &&
                d.genre &&
                d.title
            );
        }
    );
};


// 取lineChartDate的資料
function prepLCData(data){
    // 取得發行年分
    const groupByYear = d => d.release_year;
    // 取出revenue加總
    const sumOfRevenue = values => d3.sum(values, d => d.revenue);
    // 依年份加總revenue
    const sumOfRevenueByYear = d3.rollup(data, sumOfRevenue, groupByYear);

    // 只取出budget加總
    const sumOfBudget = values => d3.sum(values, d => d.budget);
    // 依年份加總budget
    const sumOfBudgetByYear = d3.rollup(data, sumOfBudget, groupByYear);

    // 放進array並照年分排序
    const revenueArray = Array.from(sumOfRevenueByYear).sort((a,b)=>a[0]-b[0]);
    const budgetArray = Array.from(sumOfBudgetByYear).sort((a,b)=>a[0]-b[0]);

    // 用年份(數字型態)來產生日期時間格式的資料，作為後續繪圖的X軸
    // year string -> data object
    const parseYear = d3.timeParse('%Y');
    const dates = revenueArray.map(d=>parseYear(d[0]));

    // 找出最大值(把各年份的revenue與各年份的budget用.concat串接，找最大值)
    const revenueAndBudgetArray = revenueArray.map(d=>d[1]).concat(budgetArray.map(d=>d[1]));
    
    const yMax = d3.max(revenueAndBudgetArray);
    // debugger;

    //最終資料回傳series:要放的線，dates時間，yMax最大值
    const lineData = {
        series:[
            {
                name:'Revenue',
                color:'dodgerblue',
                // 把資料帶入，年份一樣需要轉圜為時間格式
                values:revenueArray.map(d=>({date:parseYear(d[0]),value:d[1]}))
            },
            {
                name:'Budget',
                color:'darkorange',
                values:budgetArray.map(d=>({date:parseYear(d[0]),value:d[1]}))
            }
        ],
        dates:dates,
        yMax:yMax
    };
    // debugger;

    return lineData;
}