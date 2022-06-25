// get csv file\
// 用,type 導入下方自己創建的資料處理函式
d3.csv('data/movies01.csv',type01).then(
    res1 =>{
        ready01(res1);
        console.log('move CSV:',res1)
        // debugger;
    }
);

// 建立資料篩選ready()函式，並將資料帶入
function ready01(movies01){
    const moviesClean01 = filterData01(movies01); // 執行資料篩選

    const scatterDate01 = prepSCData01(moviesClean01);
    // console.log(scatterDate);
    setupCanvas01(scatterDate01); // 設定要畫圖的開始
};

// 繪製svg圖片
function setupCanvas01(scatterDate){
    // 建立svg繪圖空間
    const svg_width = 380;
    const svg_height = 380;
    const chart_margin = {top:80,right:40,bottom:40,left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    const this_svg = d3.select(".scatter-chart").append("svg") // 找到要繪圖的標籤
        .attr("width", svg_width).attr("height", svg_height)
        .append('g') // 建立群組
        .attr('transform', `translate(${chart_margin.left},${chart_margin.top})`); // 設定偏移
    
    // 找出最大值與最小值d3.extent
    const xExtent = d3.extent(scatterDate, d=>d.budget); 
    // (d=>d.budget) 每筆資料的revenue (d3.extent)找出最大值與最小值

    // 繪圖方式一: 最小到最大，d3.scaleLinear() 平均分布
    const xScale = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    // .domain() 是要放的資料
    // range() 畫面上要放的地方，從0到圖表結束(圖表全部)
  
    const yExtent = d3.extent(scatterDate, d=>d.revenue); 
    const yScale = d3.scaleLinear().domain(yExtent).range([chart_height,0]);
    // 數學上revenue最小的會放下方，所以要將座標相反[chart_height,0]

    // 繪製分布點
    this_svg.selectAll('.scatter') // 設定每個scatter要有什麼
            .data(scatterDate)
            .enter() //出現
            .append('circle').attr('class','scatter') // 設定點
            .attr('cx', d=>xScale(d.budget))
            .attr('cy', d=>yScale(d.revenue))
            .attr('r',3) // 設定寬度來源
            .style('fill', 'dodgerblue') // 設定樣式
            .style('fill-opacity', 0.5);


    // 畫刻度軸線
    // ticks 決定約略有幾個刻度(依數值狀況)
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(formatTicks)
                .tickSizeInner(-chart_height).tickSizeOuter(0);
    const xAxisDraw = this_svg.append('g').attr('class','x axis')
                .attr('transform',`translate(-10,${chart_height+10})`)
                .call(xAxis)
                .call(addLabel,'Budget',25,0);
    //拉開字與軸的距離
    xAxisDraw.selectAll('text').attr('dy','2em');


    // y軸
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(formatTicks)
                .tickSizeInner(-chart_width).tickSizeOuter(0);
    const yAxisDraw = this_svg.append('g').attr('class','y axis')
                .attr('transform',`translate(-10,10)`)
                .call(yAxis)
                .call(addLabel,'Revenue',-30,-30);
    //拉開字與軸的距離
    yAxisDraw.selectAll('text').attr('dx','-2em');

    //Draw header
    const header = this_svg.append('g').attr('class','bar-header')
    .attr('transform',`translate(0,${-chart_margin.top/2})`)
    .append('text');
    header.append('tspan').text('Budget vs. Revenue in $US');
    header.append('tspan').text('Top 100 films by budget, 2000-2009')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');


    function brushed(e){
        // debugger;
        if(e.selection){
            //取得選取的矩形座標(選取範圍)
            const [[x0,y0],[x1,y1]] = e.selection;
            //判斷有哪些資料落在選取範圍中
            const selected = scatterDate.filter(
                d => // 尋訪資料內
                    x0 <= xScale(d.budget) && xScale(d.budget) < x1 && // 有落在x0與x1之間且
                    y0 <= yScale(d.revenue) && yScale(d.revenue) < y1 // 有落在y0與y1之間的
            );
            // console.log(selected);
            updateSelected(selected); // 把資料丟到updateSelected函示中
            highlightSelected(selected); //  丟到highlightSelected中變綠色
        }else{ // 取消選取時 清空內容
            d3.select('.selected-body').html('');
            highlightSelected([]); // 清空選取
        }
    };

    // 選取的點變綠色
    function highlightSelected(data01){
        const selectedIDs = data01.map(d=>d.id);
        d3.selectAll('.scatter').filter(d=>selectedIDs.includes(d.id))
        .style('fill','green'); // 選到的變綠色(selectedIDs/選到)


        d3.selectAll('.scatter').filter(d=>!selectedIDs.includes(d.id))
        .style('fill','dodgerblue'); // 其他的變原色(!selectedIDs/沒選到)
    }

    let selectedId;

    function mouseoverListItem(){
        selectedId = d3.select(this).data()[0].id; // 找到資料目標
        d3.selectAll('.scatter').filter(d=>d.id === selectedId) // 再回去找點
        .transition().attr('r',6) // 讓點放大
        .style('fill','coral'); // 讓點變紅色
        // debugger;
    }

    function mouseoutListItem(){
        selectedId = d3.select(this).data()[0].id; // 找到資料目標
        d3.selectAll('.scatter').filter(d=>d.id === selectedId) // 再回去找點
        .transition().attr('r',3) // 讓點放大
        .style('fill','green'); // 變回被選取的顏色
        
    }



    // 顯示出選取的項目內容
    function updateSelected(data01){
        d3.select('.selected-body').selectAll('.selected-element')
        
        .on('mouseover',mouseoverListItem)// 加入鼠標觸發右邊內容讓左邊顯示的點放大效果
        .on('mouseout',mouseoutListItem)

        .data(data01, d=>d.id).join(
            enter =>{
                enter.append('p').attr('class','selected-element')
                .html(
                    d=>`<span class="selected-title">${d.title}</span>,
                    ${d.release_year}
                    <br>
                    budget: ${formatTicks(d.budget)} |
                    revenue: ${formatTicks(d.revenue)}`);
            },
            update =>{
                update
            },
            exit =>{
                exit.remove();
            }
        );
    }


    //Add brush(產生矩形)
    //加入範圍限定框選的矩形 .extent([[0,0],[svg_width,svg_height]])
    const brush = d3.brush().extent([[0,0],[svg_width,svg_height]]).on('brush end',brushed);
    this_svg.append('g').attr('class','brush').call(brush);
    
    // 設定顯示內容的範圍
    d3.select('.selected-container')
    .style('width',`${svg_width}px`).style('height',`${svg_height}px`);




};


function addLabel(axis, label, x, y){
    /* axis 是呼叫者 - 哪一個軸 */
        axis.selectAll('.tick:last-of-type text')
        .clone()
        .text(label)
        .attr('x',x)
        .attr('y',y)
        .style('text-anchor','start')
        .style('font-weight','bold')
        .style('fill','#555');
};

// 刻度格式轉換(數字的位數很多時，可以減少位數)
// https://github.com/d3/d3-format/blob/v3.1.0/README.md#locale_format
function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil') // 設定簡寫後的文字呈現
    .replace('G','bil')
    .replace('T','tri')

};



// data utilties 資料前處理
// 遇到NA就設定為undefined(JS的空值:undefined), 要不然就維持原本的字串 
const parseNA01 = string => (string === 'NA' ? undefined : string);

// 日期處理，d3.timeParse可指定要讀取的時間格式('%Y-%m-%d')，建立一個處理時間的方法，
// 並把資料(string)帶入，轉換為Date格式
const parseDate01 = string => d3.timeParse('%Y-%m-%d')(string);


// 將字串轉為數字，才可做加總運算
function type01(d){
    const date01 = parseDate01(d.release_date);
    
    return{
        budget:+d.budget, // +d. 將字串轉為數字
        genre:parseNA01(d.genre), // 空值轉換
        // 用JSON.parse轉為json格式,並用.map進到資料用(d=>d.name)取出name的欄位內容
        genres:JSON.parse(d.genres).map(d=>d.name),
        homepage:parseNA01(d.homepage),
        id: +d.id,
        imdb_id: parseNA01(d.imdb_id),
        original_language: parseNA01(d.original_language),
        overview:parseNA01(d.overview),
        popularity:+d.popularity,
        poster_path:parseNA01(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date01,
        release_yrar: date01.getFullYear(), // 可以自己創建欄位
        revenue: +d.revenue,
        runtime: +d.runtime,
        // status: parseNA(d.status) 不要的欄位可以直接拿掉
        tagline: parseNA01(d.tagline),
        title: parseNA01(d.title),
        // video: "FALSE"  不要的欄位可以直接拿掉
        vote_average: +d.vote_average,
        vote_count: +d.vote_count,

    }
};


// 資料篩選 
function filterData01(data01){
    return data01.filter( // .filter選出自訂條件的資料內容
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
};


// 取預算排行前100的資料
function prepSCData01(data01){
    return data01.sort((a,b)=>b.budget-a.budget)
                .filter((d,i)=>i<100);
};

