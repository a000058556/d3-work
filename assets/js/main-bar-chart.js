// get csv file\
// 用,type 導入下方自己創建的資料處理函式
d3.csv('data/movies.csv',type).then(
    res =>{
        ready(res);
        console.log('move CSV:',res)
        // debugger;
    }
);

// 建立資料篩選ready()函式，並將資料帶入
function ready(movies){
    const moviesClean = filterData(movies); // 執行資料篩選

    // 取前15 revenue
    const revenueData = chooseData("revenue",moviesClean);
    // console.log(revenueData); 
    setupCanvas(revenueData,moviesClean); // 設定要畫圖的開始
}

// 篩選revenue前15資料
// .sort 可設定欄位的排序邏輯
function chooseData(metric, moviesClean){
    const thisData = moviesClean.sort((a,b)=>b[metric]-a[metric]).filter((d,i)=>i<15);
        return thisData;
}

// 數字太長用此方法修飾為單位
function formatTicks(d){
    return d3.format('.2s')(d)
    .replace('M',' mil').replace('G',' bil').replace('T',' tri')
}

function cutText(string){
    return string.length<35 ? string : string.substring(0,35)+"...";
    // 當文字小於35=string 若大於35就切到35字+...
}

function setupCanvas(barCharData, moviesClean){
    // 設定預設指標:revenue
    let metric = 'revenue';
     
    // 若按下按鈕則更新資料
    function click(){
        metric = this.dataset.name;
        const thisData = chooseData(metric, moviesClean);
        update(thisData);
    }

    d3.selectAll('.bar-btn').on('click', click);


    // 設定更新動作
    function update(data){

        
        console.log(data);
        //Update Scale
        xMax = d3.max(data, d=>d[metric]);
        xScale_v3 = d3.scaleLinear([0, xMax], [0,chart_width]);
        
        yScale = d3.scaleBand().domain(data.map(d=> cutText(d.title)))
                    .rangeRound([0, chart_height]).paddingInner(0.25);

        //Transition Settings
        const defaultDelat = 1000;
        const trasitionDelay = d3.transition().duration(defaultDelat);

        //Update axis
        xAxisDraw.transition(trasitionDelay).call(xAxis.scale(xScale_v3));
        yAxisDraw.transition(trasitionDelay).call(yAxis.scale(yScale));
        
        //Update Header
        header.select('tspan').text(`Top 15 ${metric} movies ${metric==='popularity'?'':'in $US'}`);

        //設定動態 (出現enter()/更新updata()/消失exit())
        bars.selectAll('.bar').data(data, d=> cutText(d.title)).join(
            enter => {
                enter.append('rect').attr('class','bar')
                     .attr('x',0).attr('y',d=>yScale( cutText(d.title)))
                     .attr('height',yScale.bandwidth())
                     .style('fill','lightcyan')
                     .transition(trasitionDelay)
                     .delay((d,i)=>i*20)
                     .attr('width',d=>xScale_v3(d[metric]))
                     .style('fill','dodgerblue')
            },
            update => {
                update.transition(trasitionDelay)
                      .delay((d,i)=>i*20)
                      .attr('y',d=>yScale( cutText(d.title)))
                      .attr('width',d=>xScale_v3(d[metric]))
            },
            exit => {
                exit.transition().duration(defaultDelat/2)
                .style('fill-opacity',0).remove()
            }
        );

        //設定監聽，不然切換set後新的項目會看不到
        d3.selectAll('.bar')
        .on('mouseover',mouseover)
        .on('mousemove',mousemove)
        .on('mouseout',mouseout);

    }



    // 建立svg繪圖空間
    const svg_width = 700;
    const svg_height = 500;
    const chart_margin = {top:80,right:70,bottom:40,left:250};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    const this_svg = d3.select(".bar-chart").append("svg") // 找到要繪圖的標籤
        .attr("width", svg_width).attr("height", svg_height)
        .append('g') // 建立群組
        .attr('transform', `translate(${chart_margin.left},${chart_margin.top})`); // 設定偏移
    
    // 找出最大值與最小值d3.extent
    const xExtent = d3.extent(barCharData, d=>d.revenue); 
    // (d=>d.revenue) 每筆資料的revenue (d3.extent)找出最大值與最小值

    // 最小到最大，d3.scaleLinear() 平均分布
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    // .domain() 是要放的資料
    // range() 畫面上要放的地方，從0到圖表結束(圖表全部)
  
    // 找出最大值d3.max
    let xMax = d3.max(barCharData, d=>d.revenue);
    // (d=>d.revenue) 每筆資料的revenue (d3.max)找出最大值

    // 繪圖方式二:0到最大
    const xScale_v2 = d3.scaleLinear().domain(0,xMax).range([0,chart_width]);
    
    
    // 繪圖方式三:方式二簡短寫法，把資料,繪圖地方直接放到scaleLinear()
    let xScale_v3 = d3.scaleLinear([0,xMax],[0,chart_width]);

    // 垂直空間分配- 平均分布各類
    let yScale = d3.scaleBand().domain(barCharData.map(d=>d.title))
                    .rangeRound([0, chart_height])
                    .paddingInner(0.25);
    // scaleBand() 序數比例尺
    // 用.map來導入資料的電影總類
    // .rangeRound 畫面上要放的地方(高)，從0到圖表結束(圖表全部)
    // .paddingInner(0.25) 每個bar的粗細(0 ~ 0.9)



    const bars = this_svg.append('g').attr('class','bars');

    // 加上標題文字
    let header = this_svg.append('g').attr('class','bar-header')
                    .attr('transform', `translate(0,${-chart_margin.top/2})`) //讓文字移動
                    .append('text');
    // header.append('tspan').text('Total revenue by genre in $US');
    header.append('tspan').text('Top 15 XXX move');
    header.append('tspan').text('years:2000-2009')
            .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

    // 畫x軸刻度與文字
    let xAxis = d3.axisTop(xScale_v3).ticks(5).tickFormat(formatTicks)
                    .tickSizeInner(-chart_height)
                    .tickSizeOuter(0);
    let xAxisDraw = this_svg.append('g')
                        .attr('class','x axis');

    // 畫y軸刻度與文字
    // tickSize() :一次設定好tickSizeInner與tickSizeOuter
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisDraw = this_svg.append('g')
                        .attr('class','y axis');
    // 調整y軸文字位置
    yAxisDraw.selectAll('text').attr('dx','-0.6em');


    
    update(barCharData);

    //interactive 鼠標移入互動處理
        const tip = d3.select('.tooltip'); //綁定頁面物件
        
        function mouseover(e){
            // 取得資料
            // debugger;
            const thisBarData = d3.select(this).data()[0];

            // 列出其他細節
            const bodyData = [
                ['Budget', formatTicks(thisBarData.budget)],
                ['Revenue', formatTicks(thisBarData.revenue)],
                ['Profit', formatTicks(thisBarData.revenue - thisBarData.budget)],
                ['TMDB Popularity', Math.round(thisBarData.popularity)],
                ['IMDB Rating', thisBarData.vote_average],
                ['Genres', thisBarData.genres.join(', ')] // 分類為array，用.join在家再一起
            ];
                
            tip.style('left',(e.clientX+15)+'px') // 定位x 設定出現位置
                .style('top',e.clientY+'px') // 定位y
                .transition() //設置轉場動畫
                .style('opacity',0.98)
            tip.select('h3').html(`${thisBarData.title}, ${thisBarData.release_yrar}`)
            tip.select('h4').html(`${thisBarData.tagline}, ${thisBarData.runtime} min.`)
            // tip.select('img').html(`${thisBarData.tagline}, ${thisBarData.runtime} min.`)
            
            d3.select('.tip-body').selectAll('p').data(bodyData)
                .join('p').attr('class', 'tip-info').html(d=>`${d[0]} : ${d[1]}`);
        }

        function mousemove(e){
            tip.style('left',(e.clientX+15)+'px')
                .style('top',e.clientY+'px')
                // .style('opacity',0.98)
                // .html("Hello")
        }

        function mouseout(e){
            tip.transition().style('opacity',0)
        }


        //interactive 新增監聽與活動
        d3.selectAll('.bar') // 進入bar才觸發
            .on('mouseover',mouseover)
            .on('mousemove',mousemove)
            .on('mouseout',mouseout);
    
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
const parseNA = string => (string === 'NA' ? undefined : string);

// 日期處理，d3.timeParse可指定要讀取的時間格式('%Y-%m-%d')，建立一個處理時間的方法，
// 並把資料(string)帶入，轉換為Date格式
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);

// 將字串轉為數字，才可做加總運算
function type(d){
    const date = parseDate(d.release_date);
    
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
        release_yrar: date.getFullYear(), // 可以自己創建欄位
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


function filterData(data){
    return data.filter( // .filter選出自訂條件的資料內容
        d =>{ // 設定過濾條件，選出符合條件的資料回傳
            return( 
                d.release_yrar > 1999 && d.release_yrar < 2010 &&
                d.revenue > 0 &&
                d.budget > 0 &&
                d.genre &&
                d.title
            );
        }
    );
}


// 將資料作加總運算處理

function prepBCData(data){
    const dataMap = d3.rollup(
        data, // 要帶入的資料
        // v => 要對分類後的資料做什麼處理
        v => d3.sum(v, valu => valu.revenue), // 將每一個分類的revenue提取出來加總，valu為變數可自取
        d => d.genre // d => d.為依電影分類groupby

    );
    // debugger;
    const dataArray = Array.from(dataMap, d=>({genre:d[0],revenue:d[1]})); 
    // debugger;
    // Array.from(建立新的陣列)
    // 將第一欄命名為genre，並帶入dataMap第0欄
    // 將第二欄命名為revenue，並帶入dataMap第1欄

    // :d[0]說明--------------------
    // [...dataMap] 新建表格公式
    // [...dataMap][0]
    // ['Action', 33656636378]
    // 0: "Action"
    // 1: 33656636378

    // [...dataMap][0][0]
    // 'Action'

    // [...dataMap][0][1]
    // 33656636378
    // --------------------

    return dataArray;
};